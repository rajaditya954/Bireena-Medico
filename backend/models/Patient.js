import mongoose from "mongoose";

const PatientSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    uhid: { type: String, unique: true, sparse: true }, // Unique Hospital ID
    age: { type: Number, min: 0 },
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    bloodType: { type: String, enum: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"] },
    allergies: [{ type: String }],
    medicalHistory: [{ type: String }],
    emergencyContact: {
      name: String,
      phone: String,
      relationship: String,
    },
    insuranceInfo: {
      provider: String,
      policyNumber: String,
      expiryDate: Date,
    },
    address: String,
    city: String,
    state: String,
    zipCode: String,
  },
  { timestamps: true }
);

export default mongoose.model("Patient", PatientSchema);
