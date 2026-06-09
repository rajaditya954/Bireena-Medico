import mongoose from "mongoose";

const MedicineRequirementSchema = new mongoose.Schema(
  {
    requirementId: { type: String, unique: true, index: true },
    medicineId: { type: mongoose.Schema.Types.ObjectId, ref: "Medicine", required: true },
    requestedQty: { type: Number, required: true },
    approvedQty: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    notes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("MedicineRequirement", MedicineRequirementSchema);
