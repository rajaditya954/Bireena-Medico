import db from "../config/db-client.js";

const MedicineDistributionSchema = new db.Schema(
  {
    distributionId: { type: String, unique: true, index: true },
    patientId: { type: db.Schema.Types.ObjectId, ref: "Patient", required: true },
    prescriptionId: { type: db.Schema.Types.ObjectId, ref: "Prescription", required: true },
    medicineId: { type: db.Schema.Types.ObjectId, ref: "Medicine", required: false },
    quantity: { type: Number, required: false },
    items: [
      {
        medicine: {
          type: db.Schema.Types.ObjectId,
          ref: "Medicine",
          required: true,
        },
        quantity: { type: Number, required: true },
        unitPrice: { type: Number, required: true },
        amount: { type: Number, required: true },
      },
    ],
    totalAmount: { type: Number, default: 0 },
    distributedBy: { type: db.Schema.Types.ObjectId, ref: "User" },
    distributedAt: { type: Date, default: Date.now },
    notes: { type: String },
  },
  { timestamps: true }
);

export default db.model("MedicineDistribution", MedicineDistributionSchema);
