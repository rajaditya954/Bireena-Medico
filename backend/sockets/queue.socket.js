import { logger } from "../utils/logger.js";

export const setupQueueSocket = (io, socket) => {
  socket.on("queue:join", (data) => {
    logger.log("Patient joined queue", data);
    io.emit("queue:patient-joined", data);
  });

  socket.on("queue:checkin", (data) => {
    logger.log("Patient checked in", data);
    io.emit("queue:patient-checkedin", data);
  });

  socket.on("queue:complete", (data) => {
    logger.log("Consultation completed", data);
    io.emit("queue:consultation-completed", data);
  });

  socket.on("queue:position", (data) => {
    socket.emit("queue:position-update", data);
  });
};
