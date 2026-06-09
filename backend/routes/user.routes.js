import express from "express";
import * as userController from "../controllers/user.controller.js";

const router = express.Router();

router.get("/", userController.getAllUsers);
router.get("/:id", userController.getUserById);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);
router.post("/change-password", userController.changePassword);

export default router;
