import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { config } from "../config/env.js";
import crypto from "crypto";

class AuthService {
  async register(name, email, password, role = "PATIENT", phone = null) {
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new Error("Email already registered");
    }

    const user = new User({ 
      name, 
      email: email.toLowerCase(), 
      phone,
      role: role.toUpperCase(),
      isActive: true,
    });
    
    await user.setPassword(password);
    await user.save();

    const token = this.signToken(user);
    return { token, user: user.toSafeJSON() };
  }

  async login(email, password) {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new Error("Invalid credentials");
    }

    // Check if account is locked
    if (user.isLocked()) {
      throw new Error("Account locked. Too many failed login attempts. Try again later.");
    }

    if (!user.isActive) {
      throw new Error("User account is deactivated");
    }

    const isPasswordValid = await user.checkPassword(password);
    if (!isPasswordValid) {
      user.incFailedAttempts();
      await user.save();
      if (user.isLocked()) {
        throw new Error("Account locked due to 5 failed login attempts. Try again in 30 minutes.");
      }
      throw new Error("Invalid credentials");
    }

    user.resetFailedAttempts();
    user.lastLogin = new Date();
    await user.save();

    const token = this.signToken(user);
    return { token, user: user.toSafeJSON() };
  }

  signToken(user) {
    return jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      config.jwtSecret,
      { expiresIn: config.jwtExpire }
    );
  }

  async verifyToken(token) {
    try {
      return jwt.verify(token, config.jwtSecret);
    } catch (error) {
      throw new Error("Invalid token");
    }
  }

  async getUserById(id) {
    return await User.findById(id);
  }

  async forgotPassword(email) {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new Error("User with this email not found");
    }

    // Generate a reset token valid for 1 hour
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    
    user.resetToken = hashedToken;
    user.resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    // Return token (in production, send via email)
    return {
      message: "Password reset token generated. Token expires in 1 hour.",
      resetToken, // In production, this should NOT be returned; send via email instead
    };
  }

  async resetPassword(resetToken, newPassword) {
    if (!resetToken || newPassword.length < 6) {
      throw new Error("Invalid reset token or password too short");
    }

    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    const user = await User.findOne({
      resetToken: hashedToken,
      resetTokenExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new Error("Invalid or expired reset token");
    }

    await user.setPassword(newPassword);
    user.resetToken = null;
    user.resetTokenExpires = null;
    await user.save();

    return { message: "Password reset successfully" };
  }
}

export default new AuthService();
