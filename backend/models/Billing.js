import db from "../config/db-client.js";

const BillingSchema = new db.Schema(
  {
    invoiceNumber: { type: String, unique: true, index: true, sparse: true },
    billingId: { type: String, unique: true, index: true },
    patientId: { type: db.Schema.Types.ObjectId, ref: "Patient", required: true, index: true },
    appointmentId: { type: db.Schema.Types.ObjectId, ref: "Appointment" },
    items: [
      {
        serviceId: { type: db.Schema.Types.ObjectId, ref: "Service" },
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
    paymentSummary: {
      paidAmount: { type: Number, default: 0 },
      dueAmount: { type: Number, default: 0 },
    },
    paymentStatus: {
      type: String,
      enum: ["PAID", "PENDING", "UNPAID", "CANCELLED", "paid", "pending", "unpaid", "cancelled"],
      default: "PENDING",
    },
    status: {
      type: String,
      enum: ["draft", "pending", "paid", "cancelled", "DRAFT", "PENDING", "PAID", "FAILED", "CANCELLED"],
      default: "pending",
    },
    issuedAt: Date,
    paidAt: Date,
    notes: String,
    dueDate: Date,
  },
  { timestamps: true }
);

BillingSchema.index({ patientId: 1, createdAt: -1 });
BillingSchema.index({ status: 1, createdAt: -1 });

export default db.model("Billing", BillingSchema);
