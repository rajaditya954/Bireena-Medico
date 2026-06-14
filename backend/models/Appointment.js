import mongoose from "mongoose";

const AppointmentSchema = new mongoose.Schema(
  {
    appointmentId: { type: String, unique: true, index: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    patientName: { type: String },
    patientPhone: { type: String },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
    doctorName: { type: String },
    appointmentDate: { type: Date, required: true },
    date: { type: String }, // "yyyy-MM-dd" format
    appointmentType: {
      type: String,
      default: "WALK_IN",
    },
    type: { type: String }, // "walk-in" | "scheduled"
    consultantType: { type: String }, // "doctor" | "lab" | "both"
    priority: {
      type: String,
      default: "normal",
    },
    tokenNumber: { type: Number },
    slot: { type: String }, // "HH:MM" format
    slotId: { type: String },
    status: {
      type: String,
      default: "scheduled",
    },
    notes: { type: String },
    reason: { type: String },
    createdBy: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Appointment", AppointmentSchema);
