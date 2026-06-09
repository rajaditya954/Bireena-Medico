import mongoose from "mongoose";

const MedicineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    genericName: { type: String },
    manufacturer: { type: String },
    dosage: { type: String }, // e.g., "500mg", "10ml"
    form: { type: String, enum: ["tablet", "capsule", "liquid", "injection", "cream"] },
    description: { type: String },
    price: { type: Number, default: 0 },
    stock: { type: Number, default: 0 },
    expiryDate: { type: Date },
    sideEffects: [{ type: String }],
    contraindications: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.model("Medicine", MedicineSchema);
