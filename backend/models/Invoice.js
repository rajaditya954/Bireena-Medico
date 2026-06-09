import mongoose from "mongoose";

const InvoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, unique: true, required: true },
    billingId: { type: mongoose.Schema.Types.ObjectId, ref: "Billing", required: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["draft", "sent", "paid", "cancelled"],
      default: "draft",
    },
    invoiceDate: { type: Date, default: Date.now },
    generatedAt: { type: Date },
    dueDate: Date,
    invoicePdf: String,
    pdfUrl: String,
    notes: String,
  },
  { timestamps: true }
);

export default mongoose.model("Invoice", InvoiceSchema);
