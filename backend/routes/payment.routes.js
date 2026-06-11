// backend/routes/payment.routes.js
import express          from "express";
import * as paymentCtrl from "../controllers/payment.controller.js";
// import { protect } from "../middlewares/auth.middleware.js"; // uncomment if auth is needed

const router = express.Router();

// NOTE: /statistics must come BEFORE /:id to avoid being swallowed by the param route
router.get("/statistics",              paymentCtrl.getPaymentStatistics);

router.post("/order",                  paymentCtrl.createOrder);
router.post("/",                       paymentCtrl.createPayment);
router.get("/:id",                     paymentCtrl.getPaymentById);
router.get("/patient/:patientId",      paymentCtrl.getPatientPayments);
router.post("/:paymentId/verify",      paymentCtrl.verifyPayment);
router.post("/:paymentId/refund",      paymentCtrl.refundPayment);

export default router;