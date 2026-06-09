import appointmentService from "../services/appointment.service.js";
import { generateResponse, generateError } from "../utils/response.js";

export const getAllAppointments = async (req, res) => {
  try {
    const appointments = await appointmentService.getAllAppointments();
    res.json(generateResponse({ appointments }, "Appointments fetched successfully"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};

export const getAppointmentById = async (req, res) => {
  try {
    const appointment = await appointmentService.getAppointmentById(req.params.id);
    if (!appointment) {
      return res.status(404).json(generateError("Appointment not found"));
    }
    res.json(generateResponse({ appointment }, "Appointment fetched successfully"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};

export const createAppointment = async (req, res) => {
  try {
    const appointment = await appointmentService.createAppointment(req.body);
    res.status(201).json(generateResponse({ appointment }, "Appointment created successfully"));
  } catch (error) {
    res.status(400).json(generateError(error.message));
  }
};

export const updateAppointment = async (req, res) => {
  try {
    const appointment = await appointmentService.updateAppointment(req.params.id, req.body);
    res.json(generateResponse({ appointment }, "Appointment updated successfully"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};

export const deleteAppointment = async (req, res) => {
  try {
    await appointmentService.deleteAppointment(req.params.id);
    res.json(generateResponse({}, "Appointment deleted successfully"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};

export const getPatientAppointments = async (req, res) => {
  try {
    const appointments = await appointmentService.getAppointmentsByPatient(req.params.patientId);
    res.json(generateResponse({ appointments }, "Appointments fetched successfully"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};

export const getDoctorAppointments = async (req, res) => {
  try {
    const appointments = await appointmentService.getAppointmentsByDoctor(req.params.doctorId);
    res.json(generateResponse({ appointments }, "Appointments fetched successfully"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};
