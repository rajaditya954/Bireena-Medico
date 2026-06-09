import express from "express";
import * as laboratoryController from "../controllers/laboratory.controller.js";

const router = express.Router();

// Tests
router.get("/tests", laboratoryController.getAllTests);
router.get("/tests/:id", laboratoryController.getTestById);
router.post("/tests", laboratoryController.createTest);
router.put("/tests/:id", laboratoryController.updateTest);
router.delete("/tests/:id", laboratoryController.deleteTest);

// Reports
router.post("/reports", laboratoryController.createLabReport);
router.get("/reports/patient/:patientId", laboratoryController.getReportsByPatient);
router.put("/reports/:id/status", laboratoryController.updateReportStatus);
router.put("/reports/:id/approve", laboratoryController.approveReport);

export default router;
