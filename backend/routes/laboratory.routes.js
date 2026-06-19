import express from "express";
import * as laboratoryController from "../controllers/laboratory.controller.js";
import { uploadLabReport } from "../middlewares/upload.middleware.js";

const router = express.Router();

// Tests
router.get("/tests", laboratoryController.getAllTests);
router.get("/tests/:id", laboratoryController.getTestById);
router.post("/tests", laboratoryController.createTest);
router.put("/tests/:id", laboratoryController.updateTest);
router.delete("/tests/:id", laboratoryController.deleteTest);

// Reports
router.get("/reports", laboratoryController.getAllReports);
router.post("/reports", uploadLabReport.single("reportFile"), laboratoryController.createLabReport);
router.get("/reports/patient/:patientId", laboratoryController.getReportsByPatient);
router.put("/reports/:id/status", laboratoryController.updateReportStatus);
router.put("/reports/:id", uploadLabReport.single("reportFile"), laboratoryController.updateReport);
router.put("/reports/:id/approve", laboratoryController.approveReport);
router.delete("/reports/:id", laboratoryController.deleteReport);

// Document extraction
router.post("/extract", uploadLabReport.single("file"), laboratoryController.extractReport);

export default router;
