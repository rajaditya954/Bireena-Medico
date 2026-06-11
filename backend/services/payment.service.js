// backend/services/payment.service.js
import crypto   from "crypto";
import razorpay from "../config/razorpay.js";
import { config } from "../config/env.js";
import Payment  from "../models/Payment.js";

class PaymentService {
  // ── CRUD ────────────────────────────────────────────────────────────────

  async createPayment(paymentData) {
    const payment = new Payment(paymentData);
    await payment.save();
    return payment;
  }

  async getPaymentById(id) {
    return await Payment.findById(id).populate(["invoiceId", "patientId"]);
  }

  async getPaymentsByPatient(patientId) {
    return await Payment.find({ patientId }).populate("invoiceId").sort({ createdAt: -1 });
  }

  async getPaymentsByInvoice(invoiceId) {
    return await Payment.find({ invoiceId }).sort({ createdAt: -1 });
  }

  async updatePaymentStatus(id, status, failureReason = null) {
    const updateData = { status };
    if (failureReason)     updateData.failureReason = failureReason;
    if (status === "success") updateData.paymentDate = new Date();
    return await Payment.findByIdAndUpdate(id, updateData, { new: true });
  }

  // ── Razorpay ────────────────────────────────────────────────────────────

  /**
   * Create a Razorpay order on the backend.
   * amount  – in PAISE (multiply rupees × 100 before calling)
   * receipt – any unique string (we use appointment ID)
   */
  async createRazorpayOrder(amount, currency = "INR", receipt) {
    if (!config.razorpayKeyId || !config.razorpaySecret) {
      throw new Error(
        "Razorpay credentials are not configured on the server. " +
        "Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend/.env"
      );
    }

    const order = await razorpay.orders.create({
      amount,           // paise
      currency,
      receipt,
      payment_capture: 1,
    });

    return order;
  }

  /**
   * Verify HMAC signature returned by Razorpay after successful payment.
   * Returns true if signature is valid, false otherwise.
   */
  async verifyRazorpayPayment(razorpayPaymentId, razorpayOrderId, signature) {
    if (!razorpayPaymentId || !razorpayOrderId || !signature) return false;

    const body              = `${razorpayOrderId}|${razorpayPaymentId}`;
    const generatedSignature = crypto
      .createHmac("sha256", config.razorpaySecret)
      .update(body)
      .digest("hex");

    return generatedSignature === signature;
  }

  // ── Refund ──────────────────────────────────────────────────────────────

  async processRefund(paymentId, refundAmount) {
    const payment = await this.getPaymentById(paymentId);
    if (!payment || payment.status !== "success") {
      throw new Error("Cannot refund: payment not found or not in success state.");
    }

    // Call Razorpay refund API
    await razorpay.payments.refund(payment.transactionId, {
      amount: Math.round(refundAmount * 100), // paise
    });

    return await Payment.findByIdAndUpdate(
      paymentId,
      { status: "refunded" },
      { new: true }
    );
  }

  // ── Statistics ──────────────────────────────────────────────────────────

  async getPaymentStatistics(startDate, endDate) {
    return await Payment.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
          status: "success",
        },
      },
      {
        $group: {
          _id:         "$paymentMethod",
          totalAmount: { $sum: "$amount" },
          count:       { $sum: 1 },
        },
      },
    ]);
  }
}

export default new PaymentService();