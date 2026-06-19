import Payment from "../models/Payment.js";

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

  async processRefund(paymentId, refundAmount) {
    const payment = await this.getPaymentById(paymentId);
    if (!payment || payment.status !== "success") {
      throw new Error("Cannot refund this payment");
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

  async verifyRazorpayPayment(razorpayPaymentId, razorpayOrderId, signature) {
    // This would verify the signature with Razorpay's secret key
    // For now, just a placeholder that returns true
    return { verified: true };
  }
}

export default new PaymentService();