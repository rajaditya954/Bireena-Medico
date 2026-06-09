import mongoose from "mongoose";

const BillingSchema = new mongoose.Schema(
  {
    billingId: { type: String, unique: true, index: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
    items: [
      {
        serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Service" },
        serviceName: String,
        description: String,
        quantity: Number,
        unitPrice: Number,
        amount: Number,
      },
    ],
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, required: true },
    paymentStatus: {
      type: String,
      enum: ["PAID", "PENDING", "UNPAID", "CANCELLED"],
      default: "PENDING",
    },
    status: {
      type: String,
      enum: ["draft", "pending", "paid", "cancelled"],
      default: "pending",
    },
    notes: String,
    dueDate: Date,
  },
  { timestamps: true }
);

export default mongoose.model("Billing", BillingSchema);
