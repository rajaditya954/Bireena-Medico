// backend/validators/payment.validator.js
import { body, param, query } from "express-validator";

export const validateCreatePayment = [
  body("invoiceId").notEmpty().withMessage("invoiceId is required"),
  body("patientId").notEmpty().withMessage("patientId is required"),
  body("amount").isNumeric().withMessage("Amount must be numeric"),
  body("paymentMethod")
    .isIn(["cash", "insurance", "upi", "card", "netbanking", "other"])
    .withMessage("Invalid payment method"),
];

export const validateStatistics = [
  query("startDate").notEmpty().isISO8601().withMessage("startDate must be a valid date"),
  query("endDate").notEmpty().isISO8601().withMessage("endDate must be a valid date"),
];