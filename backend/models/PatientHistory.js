import mongoose from "mongoose";

const PatientHistorySchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", required: true },
    diagnosis: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("PatientHistory", PatientHistorySchema);
