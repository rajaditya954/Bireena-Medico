import express from "express";
import * as appointmentController from "../controllers/appointment.controller.js";

const router = express.Router();

router.get("/", appointmentController.getAllAppointments);
router.get("/:id", appointmentController.getAppointmentById);
router.post("/", appointmentController.createAppointment);
router.put("/:id", appointmentController.updateAppointment);
router.delete("/:id", appointmentController.deleteAppointment);
router.get("/patient/:patientId", appointmentController.getPatientAppointments);
router.get("/doctor/:doctorId", appointmentController.getDoctorAppointments);

export default router;
