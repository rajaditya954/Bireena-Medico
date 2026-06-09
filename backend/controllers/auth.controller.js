import authService from "../services/auth.service.js";
import { generateResponse, generateError } from "../utils/response.js";

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json(generateError("name, email, and password are required"));
    }

    const result = await authService.register(name, email, password, role);
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
    res.json(generateResponse(result, "Login successful"));
  } catch (error) {
    res.status(401).json(generateError(error.message));
  }
};

export const me = async (req, res) => {
  try {
    const user = await authService.getUserById(req.user.id);
    res.json(generateResponse({ user: user?.toSafeJSON() }, "User profile retrieved"));
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
