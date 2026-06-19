import express from "express";
import * as userController from "../controllers/user.controller.js";
import { isAdmin } from "../middlewares/role.middleware.js";
import { validateUpdateUser, validateChangePassword } from "../validators/auth.validator.js";

const router = express.Router();

// Get all users (admin only)
router.get("/", isAdmin, userController.getAllUsers);

// Admin: change another user's password
router.post("/:id/change-password", isAdmin, userController.changePasswordAdmin);

// Get user by ID (self or admin)
router.get("/:id", userController.getUserById);

// Update user (self or admin)
router.put("/:id", validateUpdateUser, userController.updateUser);

// Deactivate user (admin only) - soft delete
router.patch("/:id/deactivate", isAdmin, userController.deactivateUser);

// Activate user (admin only)
router.patch("/:id/activate", isAdmin, userController.activateUser);

// Delete user (admin only) - hard delete
router.delete("/:id", isAdmin, userController.deleteUser);

// Change user role (admin only)
router.patch("/:id/role", isAdmin, userController.changeUserRole);

// Change password (authenticated user)
router.post("/change-password", validateChangePassword, userController.changePassword);

export default router;
