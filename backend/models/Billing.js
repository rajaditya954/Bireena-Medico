import mongoose from "mongoose";

const BillingSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
    items: [
      {
        description: String,
        quantity: Number,
        unitPrice: Number,
        total: Number,
      },
    ],
    subtotal: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
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
