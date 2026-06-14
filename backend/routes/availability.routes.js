import express from "express";
import * as slotController from "../controllers/slot.controller.js";

const router = express.Router();

router.get("/:doctorId", slotController.getAvailability);

export default router;
