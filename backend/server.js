import "dotenv/config";
import http from "http";
import app from "./app.js";
import { connectDB } from "./config/database.js";
import { config } from "./config/env.js";
import { initializeSockets } from "./sockets/index.js";
import { initSocket } from "./config/socket.js";
import { logger } from "./utils/logger.js";
import pharmacyRoutes from "./routes/pharmacy.routes.js";
import prescriptionRoutes from "./routes/prescription.routes.js";
import historyRoutes from "./routes/history.routes.js";
import patientRoutes from "./routes/patient.routes.js";



const server = http.createServer(app);
app.use("/api/pharmacy", pharmacyRoutes);
app.use("/models/Medicine", pharmacyRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/history", historyRoutes);

// Initialize Socket.io
const io = initSocket(server);
initializeSockets(io);
global.io = io; // Make io globally available

// Connect to MongoDB
connectDB(config.mongoUri)
  .then(() => {
    server.listen(config.port, () => {
      logger.info(`🚀 Server running on http://localhost:${config.port}`);
      logger.info(`📦 Environment: ${config.nodeEnv}`);
      logger.info(`🗄️  Database: MongoDB connected`);
    });
  })
  .catch((err) => {
    logger.error("Database connection failed:", err);
    process.exit(1);
  });

// Graceful Shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down gracefully");
  server.close(() => {
    logger.info("Server closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  logger.info("SIGINT received, shutting down gracefully");
  server.close(() => {
    logger.info("Server closed");
    process.exit(0);
  });
});

process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", promise, "reason:", reason);
});


//app.use("/models/Medicine", pharmacyRoutes);