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
        "appointment_manager"
      ],
      default: "patient"
    },
    isActive: { type: Boolean, default: true },
    failedLoginAttempts: { type: Number, default: 0 },
    lockedUntil: { type: Date, default: null },
    resetToken: { type: String, default: null },
    resetTokenExpires: { type: Date, default: null },
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

UserSchema.methods.incFailedAttempts = function () {
  this.failedLoginAttempts = (this.failedLoginAttempts || 0) + 1;
  if (this.failedLoginAttempts >= 5) {
    this.lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // Lock for 30 minutes
  }
};

UserSchema.methods.resetFailedAttempts = function () {
  this.failedLoginAttempts = 0;
  this.lockedUntil = null;
};

UserSchema.methods.isLocked = function () {
  if (!this.lockedUntil) return false;
  if (new Date() > this.lockedUntil) {
    this.lockedUntil = null;
    return false;
  }
  return true;
};

UserSchema.methods.toSafeJSON = function () {
  return {
    _id: this._id,
    name: this.name,
    email: this.email,
    phone: this.phone,
    role: this.role,
    profileImage: this.profileImage,
    isActive: this.isActive,
    lastLogin: this.lastLogin,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export default mongoose.model("User", UserSchema);
