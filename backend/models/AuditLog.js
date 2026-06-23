import db from "../config/db-client.js";

const AuditLogSchema = new db.Schema(
  {
    userId: { type: db.Schema.Types.ObjectId, ref: "User" },
    action: { type: String, required: true }, // e.g., "CREATE", "UPDATE", "DELETE", "LOGIN"
    resource: { type: String, required: true }, // e.g., "Patient", "Appointment"
    resourceId: db.Schema.Types.Mixed,
    oldValues: db.Schema.Types.Mixed,
    newValues: db.Schema.Types.Mixed,
    ipAddress: String,
    userAgent: String,
    status: { type: String, enum: ["success", "failed"], default: "success" },
    errorMessage: String,
  },
  { timestamps: true }
);

export default db.model("AuditLog", AuditLogSchema);
