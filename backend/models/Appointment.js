import mongoose from "mongoose";

const AppointmentSchema = new mongoose.Schema(
  {
    appointmentId: { type: String, unique: true, index: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
    appointmentDate: { type: Date, required: true },
    appointmentType: {
      type: String,
      enum: ["WALK_IN", "ONLINE", "VIDEO", "OPD"],
      default: "WALK_IN",
    },
    priority: {
      type: String,
      enum: ["NORMAL", "HIGH", "URGENT"],
      default: "NORMAL",
    },
    tokenNumber: { type: Number },
    slot: { type: String, required: true }, // HH:MM format
    status: {
      type: String,
      enum: [
        "scheduled",
        "waiting",
        "WAITING",
        "in_progress",
        "IN_PROGRESS",
        "in-progress",
        "completed",
        "CANCELLED",
        "cancelled",
        "no-show",
        "NO_SHOW",
      ],
      default: "scheduled",
    },
    notes: { type: String },
    reason: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("Appointment", AppointmentSchema);
