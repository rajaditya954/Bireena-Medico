import mongoose from "mongoose";

const AppointmentSchema = new mongoose.Schema(
  {
    appointmentId: { type: String, unique: true, index: true, default: () => `APT${Date.now().toString(36)}${Math.floor(Math.random()*10000)}` },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true, index: true },
    patientName: { type: String },
    patientPhone: { type: String },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true, index: true },
    doctorName: { type: String },
    appointmentDate: { type: Date, required: true, index: true },
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

AppointmentSchema.index({ doctorId: 1, appointmentDate: 1, slot: 1 });
AppointmentSchema.index({ patientId: 1, appointmentDate: -1 });
AppointmentSchema.index({ status: 1, appointmentDate: 1 });

export default mongoose.model("Appointment", AppointmentSchema);
