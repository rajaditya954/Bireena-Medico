import { Server } from "socket.io";
import { config } from "./env.js";

export function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: config.corsOrigin,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("📱 Socket connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("📱 Socket disconnected:", socket.id);
    });
  });

  return io;
}
