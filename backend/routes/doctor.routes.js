import express from "express";
import * as doctorController from "../controllers/doctor.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/dashboard", authenticateToken, doctorController.getMyDashboard);

// Doctor-specific portal endpoints (must come before /:id)
router.get("/my-patients", authenticateToken, doctorController.getMyPatients);
router.get("/my-appointments", authenticateToken, doctorController.getMyAppointments);
router.get("/my-history", authenticateToken, doctorController.getMyHistory);
router.get("/my-prescriptions", authenticateToken, doctorController.getMyPrescriptions);
router.get("/my-reports", authenticateToken, doctorController.getMyReports);

router.get("/", doctorController.getAllDoctors);
router.get("/:id", doctorController.getDoctorById);
router.post("/", doctorController.createDoctor);
router.put("/:id", doctorController.updateDoctor);
router.delete("/:id", doctorController.deletDoctor);
router.get("/specialization/:specialization", doctorController.getDoctorsBySpecialization);

export default router;
