import mongoose from "mongoose";

const AuditLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    action: { type: String, required: true }, // e.g., "CREATE", "UPDATE", "DELETE", "LOGIN"
    resource: { type: String, required: true }, // e.g., "Patient", "Appointment"
    resourceId: mongoose.Schema.Types.Mixed,
    oldValues: mongoose.Schema.Types.Mixed,
    newValues: mongoose.Schema.Types.Mixed,
    ipAddress: String,
    userAgent: String,
    status: { type: String, enum: ["success", "failed"], default: "success" },
    errorMessage: String,
  },
  { timestamps: true }
);

export default mongoose.model("AuditLog", AuditLogSchema);
