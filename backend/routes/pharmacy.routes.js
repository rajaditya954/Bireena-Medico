import express from "express";
import * as pharmacyController from "../controllers/pharmacy.controller.js";


const router = express.Router();
router.get("/", pharmacyController.getAllMedicines);
router.get("/inventory",pharmacyController.getInventoryWithMedicines);
router.get("/dashboard-stats", pharmacyController.getDashboardStats);
router.get("/search", pharmacyController.searchMedicines);
router.get("/stock/check", pharmacyController.checkStock);
router.get("/stock/low", pharmacyController.getLowStockMedicines);
router.get("/requirements", pharmacyController.getRequirements);
router.get("/stock-alerts", pharmacyController.getStockAlerts);
router.get("/expiry-alerts", pharmacyController.getExpiryAlerts);
router.get("/recent-medicines", pharmacyController.getRecentMedicines);
router.get("/categories", pharmacyController.getCategoryCounts);
router.get("/inventory-stats",pharmacyController.getInventoryStats);
router.get("/:id", pharmacyController.getMedicineById);
router.post("/", pharmacyController.createMedicine);
router.put("/:id", pharmacyController.updateMedicine);

export default router;
