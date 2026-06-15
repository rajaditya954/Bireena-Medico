import mongoose from "mongoose";

const QueueSchema = new mongoose.Schema(
  {
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", required: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    patientName: { type: String },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
    doctorName: { type: String },
    queueNumber: { type: Number },
    tokenNumber: { type: Number },
    type: { type: String }, // "walk-in" | "scheduled"
    scheduledTime: { type: String },
    priority: { type: String },
    currentPosition: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["waiting", "in-progress", "completed", "cancelled", "scheduled"],
      default: "waiting",
    },
    date: { type: String }, // "yyyy-MM-dd" format
    estimatedWaitTime: { type: Number }, // minutes
    calledAt: { type: Date },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("Queue", QueueSchema);
