import mongoose from "mongoose";

const PrescriptionSchema = new mongoose.Schema(
  {
    prescriptionId: { type: String, unique: true, index: true },
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", required: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
    diagnosis: { type: String },
    symptoms: [{ type: String }],
    medicines: [
      {
        medicineId: { type: mongoose.Schema.Types.ObjectId, ref: "Medicine" },
        medicineName: String,
        dosage: String,
        frequency: String,
        days: Number,
        quantity: Number,
        instructions: String,
      },
    ],
    advice: { type: String },
    followUpDate: { type: Date },
    notes: { type: String },
    fileUrl: { type: String }, // PDF or image URL
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Prescription", PrescriptionSchema);
