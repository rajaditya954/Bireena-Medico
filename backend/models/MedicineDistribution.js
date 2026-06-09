import mongoose from "mongoose";

const MedicineDistributionSchema = new mongoose.Schema(
  {
    distributionId: { type: String, unique: true, index: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    prescriptionId: { type: mongoose.Schema.Types.ObjectId, ref: "Prescription", required: true },
    medicineId: { type: mongoose.Schema.Types.ObjectId, ref: "Medicine", required: true },
    quantity: { type: Number, required: true },
    distributedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    distributedAt: { type: Date, default: Date.now },
    notes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("MedicineDistribution", MedicineDistributionSchema);
