import { setupAppointmentSocket } from "./appointment.socket.js";
import { setupQueueSocket } from "./queue.socket.js";
import { setupNotificationSocket } from "./notification.socket.js";
import { logger } from "../utils/logger.js";

export const initializeSockets = (io) => {
  io.on("connection", (socket) => {
    logger.info("Client connected", { socketId: socket.id });

    // Setup different socket handlers
    setupAppointmentSocket(io, socket);
    setupQueueSocket(io, socket);
    setupNotificationSocket(io, socket);

    socket.on("disconnect", () => {
      logger.info("Client disconnected", { socketId: socket.id });
    });
  });
};
