import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: [
        "appointment", "payment", "report", "prescription", "system",
        "APPOINTMENT_CONFIRMED",
        "APPOINTMENT_REMINDER",
        "APPOINTMENT_CANCELLED",
        "PAYMENT_SUCCESS",
        "PAYMENT_FAILED",
        "LAB_REPORT_READY",
        "PRESCRIPTION_READY",
        "PRESCRIPTION_ISSUED",
        "MEDICINE_DISPENSED",
        "SYSTEM_ALERT",
        "REMINDER",
      ],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    data: mongoose.Schema.Types.Mixed,
    isRead: { type: Boolean, default: false },
    readAt: Date,
    expiresAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model("Notification", NotificationSchema);
