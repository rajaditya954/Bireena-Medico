import express from "express";
import * as paymentController from "../controllers/payment.controller.js";
import { getPatients } from "../controllers/patient.controller.js";

const router = express.Router();

router.post("/", paymentController.createPayment);
router.get("/", getPatients);
router.get("/:id", paymentController.getPaymentById);
router.get("/patient/:patientId", paymentController.getPatientPayments);
router.post("/:paymentId/verify", paymentController.verifyPayment);
router.post("/:paymentId/refund", paymentController.refundPayment);
router.get("/statistics", paymentController.getPaymentStatistics);

export default router;
