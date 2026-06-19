import rateLimit from "express-rate-limit";
import { config } from "../config/env.js";

const isDev = config.nodeEnv === "development" || config.nodeEnv === "test" || !config.nodeEnv;

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 100000 : 100, // limit each IP to 100 requests per windowMs (or 100,000 in dev)
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 100000 : 5, // limit each IP to 5 login requests per windowMs for production
  message: "Too many login attempts, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

export const paymentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: isDev ? 100000 : 10, // limit each IP to 10 payment requests per hour (or 100,000 in dev)
  message: "Too many payment attempts, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

