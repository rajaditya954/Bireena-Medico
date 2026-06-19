import express from "express";
import * as doctorController from "../controllers/doctor.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/dashboard", authenticateToken, doctorController.getMyDashboard);

router.get("/", doctorController.getAllDoctors);
router.get("/:id", doctorController.getDoctorById);
router.post("/", doctorController.createDoctor);
router.put("/:id", doctorController.updateDoctor);
router.delete("/:id", doctorController.deletDoctor);
router.get("/specialization/:specialization", doctorController.getDoctorsBySpecialization);

export default router;
