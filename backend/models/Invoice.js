import db from "../config/db-client.js";

const InvoiceSchema = new db.Schema(
  {
    invoiceNumber: { type: String, unique: true, required: true },
    billingId: { type: db.Schema.Types.ObjectId, ref: "Billing", required: true },
    patientId: { type: db.Schema.Types.ObjectId, ref: "Patient", required: true },
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

export default db.model("Invoice", InvoiceSchema);
