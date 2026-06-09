import { logger } from "../utils/logger.js";

export const setupNotificationSocket = (io, socket) => {
  socket.on("notification:subscribe", (userId) => {
    socket.join(`user-${userId}`);
    logger.log("User subscribed to notifications", { userId });
  });

  socket.on("notification:send", (data) => {
    const { userId, message } = data;
    io.to(`user-${userId}`).emit("notification:received", message);
    logger.log("Notification sent", { userId });
  });

  socket.on("notification:broadcast", (data) => {
    io.emit("notification:received", data);
    logger.log("Broadcast notification sent", data);
  });

  socket.on("disconnect", () => {
    logger.log("Socket disconnected", { socketId: socket.id });
  });
};
