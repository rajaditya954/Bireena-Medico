import express from "express";
import * as billingController from "../controllers/billing.controller.js";

const router = express.Router();

router.get("/", billingController.getAllBillings);
router.post("/", billingController.createBilling);
router.get("/patient/:patientId", billingController.getPatientBillings);
router.get("/:patientId/pending", billingController.getPendingBills);
router.get("/:id", billingController.getBillingById);
router.put("/:id/status", billingController.updateBillingStatus);
router.post("/:billingId/invoice", billingController.generateInvoice);

export default router;
