// backend/controllers/payment.controller.js
import paymentService from "../services/payment.service.js";
import { config }     from "../config/env.js";

// ── POST /api/payments/order ─────────────────────────────────────────────────
// Creates a Razorpay order and returns the order object + public key_id.
// Frontend uses the order.id and key_id to open the Razorpay checkout popup.
export const createOrder = async (req, res) => {
  try {
    const { amount, currency = "INR", receipt } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: "Invalid amount" });
    }

    const order = await paymentService.createRazorpayOrder(
      Math.round(amount),   // already in paise from frontend
      currency,
      receipt || `rcpt_${Date.now()}`
    );

    return res.status(200).json({
      success: true,
      order,
      // Send the public key to the frontend — never send the secret
      key: config.razorpayKeyId,
    });
  } catch (error) {
    console.error("[createOrder]", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── POST /api/payments ───────────────────────────────────────────────────────
// Saves a new payment record to the DB (called after Razorpay handler fires).
export const createPayment = async (req, res) => {
  try {
    const payment = await paymentService.createPayment(req.body);
    return res.status(201).json({ success: true, payment });
  } catch (error) {
    console.error("[createPayment]", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET /api/payments/:id ────────────────────────────────────────────────────
export const getPaymentById = async (req, res) => {
  try {
    const payment = await paymentService.getPaymentById(req.params.id);
    if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });
    return res.status(200).json({ success: true, payment });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET /api/payments/patient/:patientId ─────────────────────────────────────
export const getPatientPayments = async (req, res) => {
  try {
    const payments = await paymentService.getPaymentsByPatient(req.params.patientId);
    return res.status(200).json({ success: true, payments });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── POST /api/payments/:paymentId/verify ─────────────────────────────────────
// Verifies the HMAC signature from Razorpay and marks payment as success/failed.
export const verifyPayment = async (req, res) => {
  try {
    const { paymentId }                             = req.params;
    const { razorpayPaymentId, razorpayOrderId, signature } = req.body;

    const isValid = await paymentService.verifyRazorpayPayment(
      razorpayPaymentId,
      razorpayOrderId,
      signature
    );

    if (!isValid) {
      await paymentService.updatePaymentStatus(paymentId, "failed", "Signature mismatch");
      return res.status(400).json({ success: false, message: "Payment verification failed: invalid signature" });
    }

    const updated = await paymentService.updatePaymentStatus(paymentId, "success");
    return res.status(200).json({ success: true, payment: updated });
  } catch (error) {
    console.error("[verifyPayment]", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── POST /api/payments/:paymentId/refund ─────────────────────────────────────
export const refundPayment = async (req, res) => {
  try {
    const { refundAmount } = req.body;
    const refunded = await paymentService.processRefund(req.params.paymentId, refundAmount);
    return res.status(200).json({ success: true, payment: refunded });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET /api/payments/statistics ─────────────────────────────────────────────
export const getPaymentStatistics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, message: "startDate and endDate are required" });
    }
    const stats = await paymentService.getPaymentStatistics(startDate, endDate);
    return res.status(200).json({ success: true, stats });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};