require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const codeRoutes = require("./routes/codeRoutes");

const http = require("http");
const { Server } = require("socket.io");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

const authRoutes = require("./routes/authRoutes");
const roomRoutes = require("./routes/roomRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/room", roomRoutes);
app.use("/api/code", codeRoutes);

app.get("/", (req, res) => {
  res.send("Live Code Platform API Running");
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

// GLOBAL ROOM STORAGE
const rooms = {};

io.on("connection", (socket) => {

  console.log("User connected:", socket.id);

  socket.on("join-room", (roomId, username) => {

    socket.join(roomId);

    if (!rooms[roomId]) {
      rooms[roomId] = [];
    }
    if (username && !rooms[roomId].includes(username)) {
      rooms[roomId].push(username);
    }
     io.to(roomId).emit("participants", rooms[roomId]);

  });

  socket.on("code-change", (roomId, code) => {

    socket.to(roomId).emit("code-update", code);

  });
  socket.on("cursor-change", (roomId, position) => {

  socket.to(roomId).emit("cursor-update", position);

});

  socket.on("send-message", (roomId, message, username)=>{
    io.to(roomId).emit("receive-message",{
      username, 
      message
    })
  });

  socket.on("disconnect", () => {

    console.log("User disconnected:", socket.id);

  });

});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});