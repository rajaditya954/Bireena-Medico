import db from "../config/db-client.js";

const HospitalSchema = new db.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    pincode: { type: String },
    phone: { type: String },
    email: { type: String, lowercase: true, trim: true },
    logo: { type: String },
    subscriptionPlan: { type: String, default: "basic" },
    subscriptionStatus: { type: String, default: "active" },
    subscriptionExpiresAt: { type: Date },
    maxUsers: { type: Number, default: 50 },
    isActive: { type: Boolean, default: true },
    settings: { type: db.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export default db.model("Hospital", HospitalSchema);
