import mongoose from "mongoose";


const PatientSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    patientId: { type: String, unique: true, index: true },
    fullName: { type: String, required: true },
    dob: { type: Date },
    age: { type: Number, min: 0 },
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    bloodGroup: { type: String, enum: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"] },
    maritalStatus: { type: String, enum: ["Single", "Married", "Divorced", "Widowed"] },
    phone: { type: String },
    alternatePhone: { type: String },
    email: { type: String },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    pincode: { type: String },
    occupation: { type: String },
    allergies: [{ type: String }],
    chronicDiseases: [{ type: String }],
    medicalHistory: [{ type: String }],
    emergencyContact: {
      name: String,
      relation: String,
      phone: String,
    },
    insuranceInfo: {
      provider: String,
      policyNumber: String,
      expiryDate: Date,
    },
  },
  { timestamps: true }
);
const Patient =
  mongoose.models.Patient ||
  mongoose.model("Patient", PatientSchema);

export default Patient;
