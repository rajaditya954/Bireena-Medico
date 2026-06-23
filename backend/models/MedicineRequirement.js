//import { required } from "join";
import db from "../config/db-client.js";

const MedicineRequirementSchema = new db.Schema(
  {
    requirementId: { type: String},
    patientId: {
  type: db.Schema.Types.ObjectId,
  ref: "Patient",
  required: true,
},
    requestedMedicineName: String,strength: String,unitType: String,
    medicineId: {
  type: db.Schema.Types.ObjectId,
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
    requestedBy: { type: db.Schema.Types.ObjectId, ref: "User" },
    approvedBy: { type: db.Schema.Types.ObjectId, ref: "User" },
    notes: { type: String },
  },
  { timestamps: true }
);

export default db.model("MedicineRequirement", MedicineRequirementSchema);
