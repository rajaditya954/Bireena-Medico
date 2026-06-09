import express from "express";
import * as prescriptionController from "../controllers/prescription.controller.js";

const router = express.Router();

router.get("/patient/:patientId", prescriptionController.getPrescriptionsByPatient);
router.get("/:id", prescriptionController.getPrescriptionById);
router.post("/", prescriptionController.createPrescription);
router.put("/:id", prescriptionController.updatePrescription);
router.delete("/:id", prescriptionController.deletePrescription);
router.get("/patient/:patientId/active", prescriptionController.getActivePrescriptions);

export default router;
