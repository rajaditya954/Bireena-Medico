import { logger } from "../utils/logger.js";

export const setupQueueSocket = (io, socket) => {
  socket.on("join-doctor-queue", (doctorId) => {
    socket.join(`doctor:${doctorId}`);
    logger.info(`Socket ${socket.id} joined doctor room: doctor:${doctorId}`);
  });

  socket.on("leave-doctor-queue", (doctorId) => {
    socket.leave(`doctor:${doctorId}`);
    logger.info(`Socket ${socket.id} left doctor room: doctor:${doctorId}`);
  });
};
