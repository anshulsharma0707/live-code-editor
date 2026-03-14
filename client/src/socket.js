import { io } from "socket.io-client";
import API_BASE from "./config";

// const socket = io("http://localhost:5000");
const socket = io(API_BASE);

export default socket;