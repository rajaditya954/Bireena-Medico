import express from "express";
import * as authController from "../controllers/auth.controller.js";
import { validateAuthInput, validateCreateUser } from "../validators/auth.validator.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/role.middleware.js";

const router = express.Router();

// Public routes
router.post("/register", validateAuthInput, authController.register);
router.post("/login", validateAuthInput, authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

// Protected routes
router.post("/logout", authenticateToken, authController.logout);
router.get("/me", authenticateToken, authController.me);

// Admin-only routes
router.post("/create-user", authenticateToken, isAdmin, validateCreateUser, authController.createUser);

export default router;
