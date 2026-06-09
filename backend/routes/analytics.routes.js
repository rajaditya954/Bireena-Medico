import express from "express";
import * as analyticsController from "../controllers/analytics.controller.js";

const router = express.Router();

router.get("/dashboard", analyticsController.getDashboardMetrics);
router.get("/revenue", analyticsController.getRevenueAnalytics);
router.get("/patients", analyticsController.getPatientAnalytics);
router.get("/doctors", analyticsController.getDoctorAnalytics);

export default router;
