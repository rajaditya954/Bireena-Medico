import express from "express";
import * as authController from "../controllers/auth.controller.js";
import { validateAuthInput } from "../validators/auth.validator.js";

const router = express.Router();

router.post("/register", validateAuthInput, authController.register);
router.post("/login", validateAuthInput, authController.login);
router.post("/logout", authController.logout);
router.get("/me", authController.me);

export default router;
