import express from "express";
import * as paymentCtrl from "../controllers/payment.controller.js";

const router = express.Router();

router.post("/", paymentCtrl.createPayment);
router.get("/statistics", paymentCtrl.getPaymentStatistics);
router.get("/:id", paymentCtrl.getPaymentById);
router.get("/patient/:patientId", paymentCtrl.getPatientPayments);
router.post("/:paymentId/verify", paymentCtrl.verifyPayment);
router.post("/:paymentId/refund", paymentCtrl.refundPayment);
router.get("/test", (req, res) => {
  res.json({ success: true });
});
export default router;