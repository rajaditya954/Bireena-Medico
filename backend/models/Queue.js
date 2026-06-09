import mongoose from "mongoose";

const QueueSchema = new mongoose.Schema(
  {
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", required: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
    queueNumber: { type: Number, required: true },
    tokenNumber: { type: Number },
    currentPosition: { type: Number, default: 0 },
    queueStatus: {
      type: String,
      enum: ["ACTIVE", "WAITING", "IN_PROGRESS", "COMPLETED", "CANCELLED"],
      default: "ACTIVE",
    },
    status: {
      type: String,
      enum: ["waiting", "in-progress", "completed", "cancelled"],
      default: "waiting",
    },
    estimatedWaitTime: { type: Number }, // minutes
    calledAt: { type: Date },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("Queue", QueueSchema);
