import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema(
  {
    invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: "Invoice", required: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    amount: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ["credit_card", "debit_card", "upi", "net_banking", "cash", "razorpay"],
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
    failureReason: String,
    paymentDate: Date,
  },
  { timestamps: true }
);

export default mongoose.model("Payment", PaymentSchema);