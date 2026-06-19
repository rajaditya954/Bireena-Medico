import userService from "../services/user.service.js";
import { generateResponse, generateError } from "../utils/response.js";

export const getAllUsers = async (req, res) => {
  try {
    const filters = {};
    if (req.query.role) filters.role = req.query.role.toUpperCase();
    if (req.query.isActive !== undefined) filters.isActive = req.query.isActive === "true";
    
    const users = await userService.getAllUsers(filters);
    res.json(generateResponse({ users }, "Users fetched successfully"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};

export const getUserById = async (req, res) => {
  try {
    // Allow users to view their own profile or admin to view any user
    const isOwnProfile = req.user.id === req.params.id;
    const isAdmin = req.user.role?.toUpperCase() === "ADMIN";
    
    if (!isOwnProfile && !isAdmin) {
      return res.status(403).json(generateError("Not authorized to view this user"));
    }

    const user = await userService.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json(generateError("User not found"));
    }
    res.json(generateResponse({ user: user.toSafeJSON() }, "User fetched successfully"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};

export const changePasswordAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    if (!newPassword) return res.status(400).json(generateError("newPassword is required"));
    const result = await userService.changePasswordByAdmin(id, newPassword);
    res.json(generateResponse(result, "Password updated successfully"));
  } catch (error) {
    res.status(400).json(generateError(error.message));
  }
};

export const updateUser = async (req, res) => {
  try {
    // Allow users to update their own profile or admin to update any user
    const isOwnProfile = req.user.id === req.params.id;
    const isAdmin = req.user.role?.toUpperCase() === "ADMIN";
    
    if (!isOwnProfile && !isAdmin) {
      return res.status(403).json(generateError("Not authorized to update this user"));
    }

    // Prevent non-admin from changing their own role
    if (!isAdmin && req.body.role) {
      delete req.body.role;
    }

    const user = await userService.updateUser(req.params.id, req.body);
    res.json(generateResponse({ user: user?.toSafeJSON() }, "User updated successfully"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};

export const deactivateUser = async (req, res) => {
  try {
    const user = await userService.deactivateUser(req.params.id);
    res.json(generateResponse({ user: user?.toSafeJSON() }, "User deactivated successfully"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};

export const activateUser = async (req, res) => {
  try {
    const user = await userService.activateUser(req.params.id);
    res.json(generateResponse({ user: user?.toSafeJSON() }, "User activated successfully"));
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

export const changeUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!role) {
      return res.status(400).json(generateError("role is required"));
    }

    const validRoles = [
      "ADMIN",
      "DOCTOR",
      "RECEPTIONIST",
      "LAB",
      "LAB_ASSISTANT",
      "PHARMACY",
      "DISPENSARY_STAFF",
      "APPOINTMENT_MANAGER",
      "PATIENT",
      "NURSE",
      "BILLING",
    ];
    if (!validRoles.includes(role.toUpperCase())) {
      return res.status(400).json(generateError(`Invalid role. Must be one of: ${validRoles.join(", ")}`));
    }

    const user = await userService.updateUser(req.params.id, { role: role.toUpperCase() });
    res.json(generateResponse({ user: user?.toSafeJSON() }, "User role updated successfully"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};

export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json(generateError("oldPassword and newPassword are required"));
    }
    const result = await userService.changePassword(req.user.id, oldPassword, newPassword);
    res.json(generateResponse(result, "Password changed successfully"));
  } catch (error) {
    res.status(400).json(generateError(error.message));
  }
};
