import express from "express";
import * as appointmentController from "../controllers/appointment.controller.js";

const router = express.Router();

router.get("/", appointmentController.getAllAppointments);
router.get("/:id", appointmentController.getAppointmentById);
router.post("/", appointmentController.createAppointment);
router.put("/:id", appointmentController.updateAppointment);
router.delete("/:id", appointmentController.deleteAppointment);
router.put("/:id/cancel", appointmentController.cancelAppointment);
router.put("/:id/start", appointmentController.startAppointment);
router.put("/:id/complete", appointmentController.completeAppointment);
router.put("/:id/skip", appointmentController.skipAppointment);

export default router;
