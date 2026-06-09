import userService from "../services/user.service.js";
import { generateResponse, generateError } from "../utils/response.js";

export const getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers({ role: req.query.role });
    res.json(generateResponse({ users }, "Users fetched successfully"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json(generateError("User not found"));
    }
    res.json(generateResponse({ user }, "User fetched successfully"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};

export const updateUser = async (req, res) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body);
    res.json(generateResponse({ user }, "User updated successfully"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};

export const deleteUser = async (req, res) => {
  try {
    await userService.deleteUser(req.params.id);
    res.json(generateResponse({}, "User deleted successfully"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};

export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const result = await userService.changePassword(req.user.id, oldPassword, newPassword);
    res.json(generateResponse(result, "Password changed successfully"));
  } catch (error) {
    res.status(400).json(generateError(error.message));
  }
};
