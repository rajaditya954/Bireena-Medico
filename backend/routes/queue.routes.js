import express from "express";
import * as queueController from "../controllers/queue.controller.js";

const router = express.Router();

router.get("/:doctorId", queueController.getQueueByDoctor);
router.get("/:doctorId/stats", queueController.getQueueStats);
router.post("/", queueController.addToQueue);
router.put("/:queueId/checkin", queueController.checkInPatient);
router.put("/:queueId/complete", queueController.completePatient);
router.get("/:queueId/position", queueController.getQueuePosition);

export default router;
