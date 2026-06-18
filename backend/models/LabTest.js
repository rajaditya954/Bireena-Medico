import mongoose from "mongoose";

const LabTestSchema = new mongoose.Schema({
  testCode: { type: String, required: true, unique: true },
  testName: { type: String, required: true },
  category: { type: String },
  sampleType: { type: String },
  method: { type: String },
  tat: { type: String },
  description: { type: String },
  price: { type: Number, required: true },
  normalRange: { type: String },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("LabTest", LabTestSchema);
