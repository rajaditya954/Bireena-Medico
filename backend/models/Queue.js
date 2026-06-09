import mongoose from "mongoose";

const QueueSchema = new mongoose.Schema(
  {
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", required: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
    queueNumber: { type: Number, required: true },
    status: { 
      type: String, 
      enum: ["waiting", "in-progress", "completed"], 
      default: "waiting" 
    },
    estimatedWaitTime: { type: Number }, // minutes
    checkedInAt: { type: Date },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("Queue", QueueSchema);
