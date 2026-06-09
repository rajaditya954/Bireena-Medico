import mongoose from "mongoose";

const RoleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, enum: ["admin", "doctor", "patient", "billing", "nurse"] },
    permissions: [{ type: String }],
    description: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Role", RoleSchema);
