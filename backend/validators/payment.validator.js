// backend/validators/payment.validator.js
import { body, param, query } from "express-validator";

export const validateCreateOrder = [
  body("amount")
    .isNumeric().withMessage("Amount must be a number")
    .custom(v => v > 0).withMessage("Amount must be greater than 0"),
  body("currency")
    .optional()
    .isIn(["INR", "USD"]).withMessage("Unsupported currency"),
];

export const validateCreatePayment = [
  body("invoiceId").notEmpty().withMessage("invoiceId is required"),
  body("patientId").notEmpty().withMessage("patientId is required"),
  body("amount").isNumeric().withMessage("Amount must be numeric"),
  body("paymentMethod")
    .isIn(["cash", "insurance", "razorpay", "upi", "card", "netbanking", "other"])
    .withMessage("Invalid payment method"),
];

export const validateVerifyPayment = [
  param("paymentId").notEmpty().withMessage("paymentId param is required"),
  body("razorpayPaymentId").notEmpty().withMessage("razorpayPaymentId is required"),
  body("razorpayOrderId").notEmpty().withMessage("razorpayOrderId is required"),
  body("signature").notEmpty().withMessage("signature is required"),
];

export const validateStatistics = [
  query("startDate").notEmpty().isISO8601().withMessage("startDate must be a valid date"),
  query("endDate").notEmpty().isISO8601().withMessage("endDate must be a valid date"),
];