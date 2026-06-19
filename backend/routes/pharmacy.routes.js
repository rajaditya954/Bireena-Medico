import express from "express";
import * as pharmacyController from "../controllers/pharmacy.controller.js";


const router = express.Router();
router.get("/", pharmacyController.getAllMedicines);
router.post(
  "/requirements",
  pharmacyController.createRequirement
);

router.get(
  "/requirements/patient/:patientId",
  pharmacyController.getRequirementsByPatient
);
router.get("/inventory", pharmacyController.getInventoryWithMedicines);
router.get("/dashboard-stats", pharmacyController.getDashboardStats);
router.get("/search", pharmacyController.searchMedicines);
router.get("/stock/check", pharmacyController.checkStock);
router.get("/stock/low", pharmacyController.getLowStockMedicines);
router.get("/requirements", pharmacyController.getRequirements);
router.get("/stock-alerts", pharmacyController.getStockAlerts);
router.get("/expiry-alerts", pharmacyController.getExpiryAlerts);
router.get("/recent-medicines", pharmacyController.getRecentMedicines);
router.get("/categories", pharmacyController.getCategoryCounts);
router.get("/inventory-stats", pharmacyController.getInventoryStats);
router.get("/history", (req, res, next) => {
  console.log("HISTORY ROUTE HIT");
  next();
}, pharmacyController.getHistory);
router.get("/:id", pharmacyController.getMedicineById);
router.post("/", pharmacyController.createMedicine);
router.delete(
  "/requirements/:requirementId/medicine/:medicineId",
  pharmacyController.removeMedicineFromRequirement
);
router.put("/:id", pharmacyController.updateMedicine);

export default router;
