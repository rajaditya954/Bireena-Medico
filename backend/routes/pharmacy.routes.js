import express from "express";
import * as pharmacyController from "../controllers/pharmacy.controller.js";

const router = express.Router();

router.get("/", pharmacyController.getAllMedicines);
router.get("/:id", pharmacyController.getMedicineById);
router.get("/search", pharmacyController.searchMedicines);
router.post("/", pharmacyController.createMedicine);
router.put("/:id", pharmacyController.updateMedicine);
router.get("/stock/check", pharmacyController.checkStock);
router.get("/stock/low", pharmacyController.getLowStockMedicines);

export default router;
