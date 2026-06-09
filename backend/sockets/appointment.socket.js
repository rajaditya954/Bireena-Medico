import { logger } from "../utils/logger.js";

export const setupAppointmentSocket = (io, socket) => {
  socket.on("appointment:create", (data) => {
    logger.log("Appointment created via socket", data);
    io.emit("appointment:new", data);
  });

  socket.on("appointment:update", (data) => {
    logger.log("Appointment updated via socket", data);
    io.emit("appointment:updated", data);
  });

  socket.on("appointment:cancel", (data) => {
    logger.log("Appointment cancelled via socket", data);
    io.emit("appointment:cancelled", data);
  });

  socket.on("appointment:reminder", (data) => {
    logger.log("Appointment reminder sent", data);
    socket.broadcast.emit("appointment:reminder", data);
  });
};
