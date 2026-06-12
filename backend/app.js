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

// Health check
app.get("/api/health", (req, res) => {
  res.json({ ok: true, time: new Date().toISOString(), env: config.nodeEnv });
});

// Auth routes (register/login)
app.use("/api/auth", authRoutes);

// =================== SECURE PUBLIC PAYMENT ORDER ENDPOINT ===================
import rateLimit from "express-rate-limit";
import Joi from "joi";

// Specific rate limiter for order creation (10 requests per minute per IP)
const orderLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  max: 10,
  message: { error: "Too many order requests, please try again later." },
});

// Input validation schema
const orderSchema = Joi.object({
  amount: Joi.number().integer().min(100).max(10000000).required(), // amount in paise (min ₹1, max ₹100k)
  currency: Joi.string().valid("INR").default("INR"),
  receipt: Joi.string().max(40).optional(),
});

app.post("/api/payments/order", orderLimiter, async (req, res, next) => {
  try {
    // Validate input
    const { error, value } = orderSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { amount, currency, receipt } = value;

    // Ensure Razorpay is configured
    const razorpay = (await import("./config/razorpay.js")).default;
    if (!razorpay) {
      return res.status(500).json({ error: "Payment gateway not configured" });
    }

    const options = {
      amount,
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
      payment_capture: 1,
    };

    const order = await razorpay.orders.create(options);

    // Send back order + public key (never send secret)
    res.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      },
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    logger.error("Order creation failed", error);
    res.status(500).json({ error: "Failed to create order" });
  }
});

// =================== PROTECTED ROUTES (JWT required) ===================
app.use(authenticateToken);   // apply JWT auth to all routes below

app.use("/api/users", userRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/queue", queueRoutes);
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