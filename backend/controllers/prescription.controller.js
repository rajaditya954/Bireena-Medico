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

export const getClinicHistory = async (req, res) => {
  try {
    const prescriptions = await Prescription.find()
      .populate("patientId")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: prescriptions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const seedPrescriptions = async (req, res) => {
  try {
    // insertMany([...])
  } catch (err) {
    res.status(500).json(err);
  }
};

export const updatePatientMedicines = async (req, res) => {
  try {
    const { patientId, medicines } = req.body;

    const prescription = await Prescription.findOne({
      patientId
    }).sort({ createdAt: -1 });

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found"
      });
    }

    prescription.medicines = medicines;

    await prescription.save();

    res.json({
      success: true,
      message: "Medicines updated",
      data: prescription
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};