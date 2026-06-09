import mongoose from "mongoose";

const AppointmentSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
    appointmentDate: { type: Date, required: true },
    slot: { type: String, required: true }, // HH:MM format
    status: { 
      type: String, 
      enum: ["scheduled", "completed", "cancelled", "no-show"], 
      default: "scheduled" 
    },
    reason: { type: String },
    notes: { type: String },
    prescription: { type: String }, // file path or URL
    isReminder: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Appointment", AppointmentSchema);
