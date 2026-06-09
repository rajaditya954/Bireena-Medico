import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema(
  {
    employeeId: { type: String, unique: true, sparse: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    phone: { type: String },
    profileImage: { type: String },
    role: { 
      type: String, 
      enum: [
        "admin",
        "billing",
        "doctor",
        "nurse",
        "patient",
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
      default: "patient" 
    },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

UserSchema.methods.setPassword = async function (plain) {
  this.passwordHash = await bcrypt.hash(plain, 10);
};

UserSchema.methods.checkPassword = function (plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

UserSchema.methods.toSafeJSON = function () {
  return { 
    _id: this._id, 
    name: this.name, 
    email: this.email, 
    phone: this.phone,
    role: this.role,
    profileImage: this.profileImage,
  };
};

export default mongoose.model("User", UserSchema);
