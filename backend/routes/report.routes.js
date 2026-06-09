import express from "express";
import * as reportController from "../controllers/report.controller.js";

const router = express.Router();

router.get("/labs", reportController.getLabReports);
router.get("/labs/:id", reportController.getReportById);
router.post("/labs", reportController.createLabReport);
router.put("/labs/:id/status", reportController.updateReportStatus);
router.get("/audit-logs", reportController.getAuditLogs);

export default router;
