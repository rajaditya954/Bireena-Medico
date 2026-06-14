import express from "express";
import * as doctorController from "../controllers/doctor.controller.js";

const router = express.Router();

router.get("/", doctorController.getAllDoctors);
router.get("/:id", doctorController.getDoctorById);
router.post("/", doctorController.createDoctor);
router.put("/:id", doctorController.updateDoctor);
router.delete("/:id", doctorController.deletDoctor);
router.get("/specialization/:specialization", doctorController.getDoctorsBySpecialization);

export default router;
