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
import * as authController from "./controllers/auth.controller.js";
import { validateCreateUser } from "./validators/auth.validator.js";
import { isAdmin } from "./middlewares/role.middleware.js";
import userRoutes from "./routes/user.routes.js";
import patientRoutes from "./routes/patient.routes.js";
import doctorRoutes from "./routes/doctor.routes.js";
import appointmentRoutes from "./routes/appointment.routes.js";
import queueRoutes from "./routes/queue.routes.js";
import slotRoutes from "./routes/slot.routes.js";
import availabilityRoutes from "./routes/availability.routes.js";
import prescriptionRoutes from "./routes/prescription.routes.js";
import laboratoryRoutes from "./routes/laboratory.routes.js";
import pharmacyRoutes from "./routes/pharmacy.routes.js";
import billingRoutes from "./routes/billing.routes.js";
import paymentRoutes from "./routes/payment.routes.js";        // contains verify, refund, etc.
import notificationRoutes from "./routes/notification.routes.js";
import reportRoutes from "./routes/report.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";

const app = express();

// --- MIDDLEWARE ---
app.use(morgan("dev"));
app.use((req, res, next) => {
  logger.debug(`${req.method} ${req.path}`, { body: req.body, query: req.query });
  next();
});
app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Rate limiting for login and general API
app.use("/api/auth/login", loginLimiter);
app.use(generalLimiter);

// --- PUBLIC ROUTES (No authentication) ---

// Root Route
app.get("/", (req, res) => {
  res.json({
    message: "🏥 Bireena Medico Hospital API",
    version: "2.0.0",
    status: "running",
    healthCheck: "/api/health",
    docs: "API endpoints require /api prefix",
  });
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ ok: true, time: new Date().toISOString(), env: config.nodeEnv });
});

// Auth routes (register/login)
app.use("/api/auth", authRoutes);

// Admin compatibility route alias
app.post(
  "/api/admin/users",
  authenticateToken,
  isAdmin,
  validateCreateUser,
  authController.createUser
);



// =================== PROTECTED ROUTES (JWT required) ===================
app.use(authenticateToken);   // apply JWT auth to all routes below

app.use("/api/users", userRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/queue", queueRoutes);
app.use("/api/slots", slotRoutes);
app.use("/api/availability", availabilityRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/laboratory", laboratoryRoutes);
app.use("/api/pharmacy", pharmacyRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/payments", paymentRoutes);          // verify, refund, statistics – all protected
app.use("/api/notifications", notificationRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/analytics", analyticsRoutes);

// --- ERROR HANDLING ---
app.use(notFoundHandler);
app.use(errorHandler);

export default app;