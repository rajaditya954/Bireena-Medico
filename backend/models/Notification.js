import db from "../config/db-client.js";

const NotificationSchema = new db.Schema(
  {
    userId: { type: db.Schema.Types.ObjectId, ref: "User", required: true },
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
    data: db.Schema.Types.Mixed,
    isRead: { type: Boolean, default: false },
    readAt: Date,
    expiresAt: Date,
  },
  { timestamps: true }
);

export default db.model("Notification", NotificationSchema);
