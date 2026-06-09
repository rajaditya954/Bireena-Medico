import mongoose from "mongoose";

const LabTestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    code: { type: String, unique: true },
    description: { type: String },
    category: { type: String }, // e.g., "Pathology", "Radiology"
    sampleType: { type: String }, // e.g., "Blood", "Urine"
    normalRange: { type: String },
    unit: { type: String },
    price: { type: Number, required: true },
    turnaroundTime: { type: Number }, // hours
    preparationInstructions: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("LabTest", LabTestSchema);
