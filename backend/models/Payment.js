// backend/models/Payment.js
import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
      required: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
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
      enum: ["cash", "insurance", "upi", "card", "netbanking", "other"],
      default: "cash",
    },
    status: {
      type: String,
      enum: ["pending", "success", "failed", "refunded"],
      default: "pending",
    },

    paymentDate:  { type: Date },
    failureReason:{ type: String, default: "" },
    notes:        { type: String, default: "" },
  },
  { timestamps: true }
);

// Index for fast lookups
paymentSchema.index({ patientId: 1 });
paymentSchema.index({ invoiceId: 1 });
paymentSchema.index({ status: 1 });

export default mongoose.model("Payment", paymentSchema);