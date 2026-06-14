import express from "express";
import * as slotController from "../controllers/slot.controller.js";

const router = express.Router();

router.get("/available", slotController.getAvailableSlots);
router.post("/generate", slotController.generateSlots);

export default router;
