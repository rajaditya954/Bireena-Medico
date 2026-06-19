//import { required } from "join";
import mongoose from "mongoose";

const MedicineRequirementSchema = new mongoose.Schema(
  {
    requirementId: { type: String},
    patientId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Patient",
  required: true,
},
    requestedMedicineName: String,strength: String,unitType: String,
    medicineId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Medicine",
  required: false
},

requestedMedicineName: String,
strength: String,
unitType: String,
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
