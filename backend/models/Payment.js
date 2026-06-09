import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema(
  {
    paymentId: { type: String, unique: true, index: true },
    invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: "Invoice", required: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    amount: { type: Number, required: true },
    billingId: { type: mongoose.Schema.Types.ObjectId, ref: "Billing" },
    paymentMethod: {
      type: String,
      enum: ["CASH", "UPI", "CARD", "NETBANKING", "INSURANCE", "credit_card", "debit_card", "razorpay"],
      required: true,
    },
    transactionId: { type: String, unique: true },
    razorpayPaymentId: String,
    razorpayOrderId: String,
    status: {
      type: String,
      enum: ["pending", "success", "failed", "refunded"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["SUCCESS", "PENDING", "FAILED", "REFUNDED"],
      default: "PENDING",
    },
    failureReason: String,
    paidAt: { type: Date },
    paymentDate: Date,
  },
  { timestamps: true }
);

export default mongoose.model("Payment", PaymentSchema);