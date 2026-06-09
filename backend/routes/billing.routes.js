import express from "express";
import * as billingController from "../controllers/billing.controller.js";

const router = express.Router();

router.post("/", billingController.createBilling);
router.get("/:id", billingController.getBillingById);
router.get("/patient/:patientId", billingController.getPatientBillings);
router.put("/:id/status", billingController.updateBillingStatus);
router.post("/:billingId/invoice", billingController.generateInvoice);
router.get("/:patientId/pending", billingController.getPendingBills);

export default router;
