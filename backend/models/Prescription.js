import mongoose from "mongoose";

const PrescriptionSchema = new mongoose.Schema(
  {
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", required: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
    medicines: [
      {
        medicineId: { type: mongoose.Schema.Types.ObjectId, ref: "Medicine" },
        dosage: String,
        frequency: String, // e.g., "twice daily"
        duration: String, // e.g., "7 days"
        instructions: String,
      },
    ],
    notes: { type: String },
    fileUrl: { type: String }, // PDF or image URL
    isActive: { type: Boolean, default: true },
    expiryDate: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("Prescription", PrescriptionSchema);
