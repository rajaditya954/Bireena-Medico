import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { config } from "../config/env.js";

class AuthService {
  async register(name, email, password, role = "patient") {
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new Error("Email already registered");
    }

    const user = new User({ 
      name, 
      email: email.toLowerCase(), 
      role,
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

    const isPasswordValid = await user.checkPassword(password);
    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    user.lastLogin = new Date();
    await user.save();

    const token = this.signToken(user);
    return { token, user: user.toSafeJSON() };
  }

  signToken(user) {
    return jwt.sign(
      { id: user._id, role: user.role },
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
}

export default new AuthService();
