// backend/models/Payment.js
import db from "../config/db-client.js";

const paymentSchema = new db.Schema(
  {
    paymentId: { type: String, unique: true, index: true },
    invoiceId: {
      type: db.Schema.Types.ObjectId,
      ref: "Invoice",
      required: false,
    },
    bill: {
      type: db.Schema.Types.ObjectId,
      ref: "Billing",
      required: false,
    },
    patientId: {
      type: db.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "insurance", "upi", "card", "netbanking", "other", "CASH", "UPI", "CARD", "NETBANKING", "INSURANCE", "RAZORPAY", "razorpay"],
      default: "cash",
    },
    status: {
      type: String,
      enum: ["pending", "success", "failed", "refunded", "CREATED", "SUCCESS", "FAILED", "REFUNDED"],
      default: "pending",
    },
    transactionId: { type: String, unique: true, sparse: true },
    razorpayPaymentId: String,
    razorpayOrderId: String,
    signature: String,
    paymentDate:  { type: Date },
    completedAt:  { type: Date },
    failureReason:{ type: String, default: "" },
    notes:        { type: String, default: "" },
  },
  { timestamps: true }
);

// Index for fast lookups
paymentSchema.index({ patientId: 1 });
paymentSchema.index({ invoiceId: 1 });
paymentSchema.index({ status: 1 });

export default db.model("Payment", paymentSchema);
