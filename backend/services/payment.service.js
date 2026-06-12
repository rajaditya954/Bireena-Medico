import Payment from "../models/Payment.js";
import crypto from "crypto";
import razorpay from "../config/razorpay.js";

class PaymentService {
  async createPayment(paymentData) {
    const payment = new Payment(paymentData);
    await payment.save();
    return payment;
  }

  async getPaymentById(id) {
    return await Payment.findById(id).populate(["invoiceId", "patientId"]);
  }

  async getPaymentsByPatient(patientId) {
    return await Payment.find({ patientId }).populate("invoiceId");
  }

  async getPaymentsByInvoice(invoiceId) {
    return await Payment.find({ invoiceId });
  }

  async updatePaymentStatus(id, status, failureReason = null) {
    const updateData = { status, paymentStatus: status.toUpperCase() };  // keep both fields consistent
    if (failureReason) updateData.failureReason = failureReason;
    if (status === "success") {
      updateData.paidAt = new Date();
      updateData.paymentDate = new Date();
    }

    return await Payment.findByIdAndUpdate(id, updateData, { new: true });
  }

  async verifyRazorpayPayment(paymentId, orderId, signature) {
    if (!razorpay) {
      throw new Error("Razorpay not configured. Check your API keys.");
    }

    const secret = process.env.RAZORPAY_SECRET;
    const body = orderId + "|" + paymentId;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    return expectedSignature === signature;
  }

  async processRefund(paymentId, refundAmount) {
    const payment = await this.getPaymentById(paymentId);
    if (!payment || payment.status !== "success") {
      throw new Error("Cannot refund this payment");
    }

    // Optional: call Razorpay refund API if you have razorpay_payment_id stored
    if (razorpay && payment.razorpayPaymentId) {
      try {
        const refund = await razorpay.payments.refund(payment.razorpayPaymentId, {
          amount: refundAmount * 100, // convert to paise
        });
        // You may store refund details in a separate collection
      } catch (err) {
        console.error("Razorpay refund failed:", err);
        throw new Error("Refund failed at payment gateway");
      }
    }

    const updatedPayment = await Payment.findByIdAndUpdate(
      paymentId,
      { status: "refunded", paymentStatus: "REFUNDED" },
      { new: true }
    );
    return updatedPayment;
  }

  async getPaymentStatistics(startDate, endDate) {
    return await Payment.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: "success",
        },
      },
      {
        $group: {
          _id: "$paymentMethod",
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);
  }
}

export default new PaymentService();