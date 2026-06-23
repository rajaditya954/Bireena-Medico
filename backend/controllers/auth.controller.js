import authService from "../services/auth.service.js";
import { generateResponse, generateError } from "../utils/response.js";
import Patient from "../models/Patient.js";

export const register = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json(generateError("name, email, and password are required"));
    }

    const result = await authService.register(name, email, password, role || "PATIENT", phone);
    if (result.user && (result.user.role === "PATIENT" || result.user.role === "patient")) {
      const patient = await Patient.findOne({ userId: result.user._id });
      if (patient) {
        result.user.patientId = patient._id;
      }
    }
    res.status(201).json(generateResponse(result, "User registered successfully"));
  } catch (error) {
    res.status(400).json(generateError(error.message));
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json(generateError("email and password are required"));
    }

    const result = await authService.login(email, password);
    if (result.user && (result.user.role === "PATIENT" || result.user.role === "patient")) {
      const patient = await Patient.findOne({ userId: result.user._id });
      if (patient) {
        result.user.patientId = patient._id;
      }
    }
    res.json(generateResponse(result, "Login successful"));
  } catch (error) {
    res.status(401).json(generateError(error.message));
  }
};

export const me = async (req, res) => {
  try {
    const user = await authService.getUserById(req.user.id);
    if (!user) {
      return res.status(401).json(generateError("User not found"));
    }
    const userJSON = user.toSafeJSON();
    if (userJSON && (userJSON.role === "PATIENT" || userJSON.role === "patient")) {
      const patient = await Patient.findOne({ userId: userJSON._id });
      if (patient) {
        userJSON.patientId = patient._id;
      }
    }
    res.json(generateResponse({ user: userJSON }, "User profile retrieved"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};

export const logout = async (req, res) => {
  try {
    res.json(generateResponse({}, "Logout successful"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};

export const createUser = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json(generateError("name, email, password, and role are required"));
    }

    const result = await authService.register(name, email, password, role, phone);
    res.status(201).json(generateResponse(result, "User created successfully by admin"));
  } catch (error) {
    res.status(400).json(generateError(error.message));
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json(generateError("email is required"));
    }

    const result = await authService.forgotPassword(email);
    res.json(generateResponse(result, "Password reset token sent"));
  } catch (error) {
    res.status(400).json(generateError(error.message));
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res.status(400).json(generateError("resetToken and newPassword are required"));
    }

    const result = await authService.resetPassword(resetToken, newPassword);
    res.json(generateResponse(result, "Password reset successfully"));
  } catch (error) {
    res.status(400).json(generateError(error.message));
  }
};
