import express from "express";
import cors from "cors";
import morgan from "morgan";
import { config } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware.js";
import { generalLimiter, loginLimiter } from "./middlewares/rateLimiter.middleware.js";
import { authenticateToken } from "./middlewares/auth.middleware.js";
import { logger } from "./utils/logger.js";

// Routes
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import patientRoutes from "./routes/patient.routes.js";
import doctorRoutes from "./routes/doctor.routes.js";
import appointmentRoutes from "./routes/appointment.routes.js";
import queueRoutes from "./routes/queue.routes.js";
import prescriptionRoutes from "./routes/prescription.routes.js";
import laboratoryRoutes from "./routes/laboratory.routes.js";
import pharmacyRoutes from "./routes/pharmacy.routes.js";
import billingRoutes from "./routes/billing.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import reportRoutes from "./routes/report.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";

const app = express();

// --- MIDDLEWARE ---

// Logging
app.use(morgan("dev"));
app.use((req, res, next) => {
  logger.debug(`${req.method} ${req.path}`, {
    body: req.body,
    query: req.query,
  });
  next();
});

// CORS
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
}));

// Body Parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Static files (uploaded reports)
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Rate Limiting
app.use("/api/auth/login", loginLimiter);
app.use(generalLimiter);

// --- ROUTES ---

// Health Check
app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    time: new Date().toISOString(),
    env: config.nodeEnv,
  });
});

// Auth Routes (No auth required)
app.use("/api/auth", authRoutes);

// Protected Routes (Require authentication)
app.use("/api/users", authenticateToken, userRoutes);
app.use("/api/patients", authenticateToken, patientRoutes);
app.use("/api/doctors", authenticateToken, doctorRoutes);
app.use("/api/appointments", authenticateToken, appointmentRoutes);
app.use("/api/queue", authenticateToken, queueRoutes);
app.use("/api/prescriptions", authenticateToken, prescriptionRoutes);
app.use("/api/laboratory", authenticateToken, laboratoryRoutes);
app.use("/api/pharmacy", authenticateToken, pharmacyRoutes);
app.use("/api/billing", authenticateToken, billingRoutes);
app.use("/api/payments", authenticateToken, paymentRoutes);
app.use("/api/notifications", authenticateToken, notificationRoutes);
app.use("/api/reports", authenticateToken, reportRoutes);
app.use("/api/analytics", authenticateToken, analyticsRoutes);

// --- ERROR HANDLING ---

// 404 Handler
app.use(notFoundHandler);

// Error Handler (Must be last)
app.use(errorHandler);

export default app;
