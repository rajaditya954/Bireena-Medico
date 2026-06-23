import db from "../config/db-client.js";

const LabTestSchema = new db.Schema({
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

export default db.model("LabTest", LabTestSchema);
