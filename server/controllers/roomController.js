const Room = require("../models/Room");
const { nanoid } = require("nanoid");


// CREATE ROOM
exports.createRoom = async (req, res) => {

  try {

    const roomId = nanoid(6);

    const newRoom = new Room({
      roomId,
      createdBy: req.userId,
      participants: [req.userId]
    });

    await newRoom.save();

    res.json({
      message: "Room created successfully",
      roomId,
      roomLink: `http://localhost:5173/room/${roomId}`
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }

};



// JOIN ROOM
exports.joinRoom = async (req, res) => {

  try {

    const { roomId } = req.body;

    const room = await Room.findOne({ roomId });

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    if (!room.participants.includes(req.userId)) {
      room.participants.push(req.userId);
    }

    await room.save();

    res.json({
      message: "Joined room successfully",
      roomId
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }

};

module.exports = {
  createRoom: exports.createRoom,
  joinRoom: exports.joinRoom
};