require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const codeRoutes = require("./routes/codeRoutes");

const http = require("http");
const { Server } = require("socket.io");

const app = express();

connectDB();

const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://live-code-editor-8u64.onrender.com',
  // Add your Vercel URL below:
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    // Allow any vercel.app subdomain
    if (/\.vercel\.app$/.test(origin)) return callback(null, true);
    return callback(new Error('CORS not allowed: ' + origin));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

const authRoutes  = require("./routes/authRoutes");
const roomRoutes  = require("./routes/roomRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/room", roomRoutes);
app.use("/api/code", codeRoutes);

app.get("/", (req, res) => res.send("Live Code Platform API Running"));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
      if (origin.endsWith(".vercel.app")) return callback(null, true);
      return callback(new Error("Socket CORS blocked: " + origin));
    },
    credentials: true,
    methods: ["GET", "POST"],
  },
});

const INACTIVE_TIMEOUT = 60 * 60 * 1000; // 1 hour in ms
const MAX_CHAT_HISTORY = 200;             // max messages stored per room

// ── In-memory room store ──
// rooms[roomId] = {
//   participants: [{ socketId, username }],
//   chat:         [{ username, message, time }],
//   lastActivity: Date (timestamp),
//   inactiveTimer: setTimeout ref
// }
const rooms = {};

// socketId -> { roomId, username }
const socketMap = {};

// ── Helpers ──

function getRoom(roomId) {
  if (!rooms[roomId]) {
    rooms[roomId] = {
      participants: [],
      chat:         [],
      lastActivity: Date.now(),
      inactiveTimer: null,
    };
  }
  return rooms[roomId];
}

function broadcastParticipants(roomId) {
  const room = rooms[roomId];
  if (!room) return;
  const usernames = [...new Set(room.participants.map((u) => u.username))];
  io.to(roomId).emit("participants", usernames);
}

// Reset the 1-hour inactivity timer for a room
function resetInactiveTimer(roomId) {
  const room = rooms[roomId];
  if (!room) return;

  room.lastActivity = Date.now();

  // Clear existing timer
  if (room.inactiveTimer) clearTimeout(room.inactiveTimer);

  // Set new 1-hour timer
  room.inactiveTimer = setTimeout(() => {
    console.log(`Room ${roomId} inactive for 1hr — deleting.`);
    // Notify anyone still connected
    io.to(roomId).emit("room-expired", {
      message: "This room has been inactive for 1 hour and has been closed.",
    });
    // Clean up
    delete rooms[roomId];
  }, INACTIVE_TIMEOUT);
}

// Remove a socket from its room and broadcast update
function removeFromRoom(socketId) {
  const info = socketMap[socketId];
  if (!info) return;

  const { roomId, username } = info;
  const room = rooms[roomId];

  if (room) {
    room.participants = room.participants.filter((u) => u.socketId !== socketId);

    if (room.participants.length === 0) {
      // Room is empty — start the inactivity countdown
      resetInactiveTimer(roomId);
    } else {
      broadcastParticipants(roomId);
      io.to(roomId).emit("user-left", { username });
    }
  }

  delete socketMap[socketId];
}

// ── Socket Events ──

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // JOIN ROOM
  socket.on("join-room", (roomId, username) => {
    const cleanName = (username || "").trim();
    if (!cleanName || cleanName === "null" || cleanName === "undefined") return;

    socket.join(roomId);

    const room = getRoom(roomId);

    // Clear inactivity timer — room is active again
    if (room.inactiveTimer) {
      clearTimeout(room.inactiveTimer);
      room.inactiveTimer = null;
    }
    room.lastActivity = Date.now();

    // Remove stale entry for this socket (reconnect case)
    room.participants = room.participants.filter((u) => u.socketId !== socket.id);
    room.participants.push({ socketId: socket.id, username: cleanName });

    socketMap[socket.id] = { roomId, username: cleanName };

    broadcastParticipants(roomId);

    // Send existing chat history to the newly joined user
    socket.emit("chat-history", room.chat);

    console.log(`${cleanName} joined room ${roomId} (${room.participants.length} online)`);
  });

  // EXPLICIT LEAVE
  socket.on("leave-room", (roomId) => {
    removeFromRoom(socket.id);
    socket.leave(roomId);
  });

  // CODE SYNC
  socket.on("code-change", (roomId, code) => {
    resetInactiveTimer(roomId);
    socket.to(roomId).emit("code-update", code);
  });

  // CURSOR SYNC — broadcast position + username to others
  socket.on("cursor-change", (roomId, position) => {
    const info = socketMap[socket.id];
    if (!info) return;
    socket.to(roomId).emit("cursor-update", {
      socketId: socket.id,
      username: info.username,
      position, // { lineNumber, column }
    });
  });

  // CURSOR REMOVED — notify others when user blurs editor
  socket.on("cursor-remove", (roomId) => {
    socket.to(roomId).emit("cursor-removed", { socketId: socket.id });
  });

  // CHAT MESSAGE
  socket.on("send-message", (roomId, message, username) => {
    const cleanName = (username || "").trim();
    if (!cleanName || cleanName === "null") return;

    const room = getRoom(roomId);
    resetInactiveTimer(roomId);

    const msgObj = {
      username: cleanName,
      message,
      time: new Date().toISOString(),
    };

    // Store in history (cap at MAX_CHAT_HISTORY)
    room.chat.push(msgObj);
    if (room.chat.length > MAX_CHAT_HISTORY) {
      room.chat = room.chat.slice(-MAX_CHAT_HISTORY);
    }

    // Broadcast to everyone in the room
    io.to(roomId).emit("receive-message", msgObj);
  });

  // DISCONNECT (tab close, network drop)
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    removeFromRoom(socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});