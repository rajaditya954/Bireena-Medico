import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    phone: { type: String },
    profilePicture: { type: String },
    role: { 
      type: String, 
      enum: ["admin", "billing", "doctor", "nurse", "patient"], 
      default: "patient" 
    },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
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
    profilePicture: this.profilePicture,
  };
};

export default mongoose.model("User", UserSchema);
