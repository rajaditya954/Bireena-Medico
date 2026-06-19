import prescriptionService from "../services/prescription.service.js";
import { generateResponse, generateError } from "../utils/response.js";
import doctorService from "../services/doctor.service.js";

export const getPrescriptionsByPatient = async (req, res) => {
  try {
    const prescriptions = await prescriptionService.getPrescriptionsByPatient(req.params.patientId);
    res.json(generateResponse({ prescriptions }, "Prescriptions fetched successfully"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};

export const getPrescriptionById = async (req, res) => {
  try {
    const prescription = await prescriptionService.getPrescriptionById(req.params.id);
    if (!prescription) {
      return res.status(404).json(generateError("Prescription not found"));
    }
    res.json(generateResponse({ prescription }, "Prescription fetched successfully"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};

export const createPrescription = async (req, res) => {
  try {
    if (!req.body.doctorId && req.user && req.user.id) {
      let doctor = await doctorService.getDoctorByUserId(req.user.id);
      if (!doctor) {
        const Doctor = (await import("../models/Doctor.js")).default;
        doctor = await Doctor.findOne({});
      }
      if (doctor) {
        req.body.doctorId = doctor._id;
      }
    }
    const prescription = await prescriptionService.createPrescription(req.body);
    res.status(201).json(generateResponse({ prescription }, "Prescription created successfully"));
  } catch (error) {
    res.status(400).json(generateError(error.message));
  }
};

export const updatePrescription = async (req, res) => {
  try {
    const prescription = await prescriptionService.updatePrescription(req.params.id, req.body);
    res.json(generateResponse({ prescription }, "Prescription updated successfully"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};

export const deletePrescription = async (req, res) => {
  try {
    await prescriptionService.deletePrescription(req.params.id);
    res.json(generateResponse({}, "Prescription deleted successfully"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};

export const getActivePrescriptions = async (req, res) => {
  try {
    const prescriptions = await prescriptionService.getActivePrescriptions(req.params.patientId);
    res.json(generateResponse({ prescriptions }, "Active prescriptions fetched"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};
