import db from "../config/db-client.js";

const RoleSchema = new db.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      enum: [
        "admin",
        "doctor",
        "patient",
        "billing",
        "nurse",
        "lab_assistant",
        "dispensary_staff",
        "appointment_manager",
        "ADMIN",
        "BILLING",
        "DOCTOR",
        "NURSE",
        "PATIENT",
        "LAB_ASSISTANT",
        "DISPENSARY_STAFF",
        "APPOINTMENT_MANAGER",
      ],
    },
    permissions: [{ type: String }],
    description: { type: String },
  },
  { timestamps: true }
);

export default db.model("Role", RoleSchema);
