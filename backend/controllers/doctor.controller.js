import doctorService from "../services/doctor.service.js";
import { generateResponse, generateError } from "../utils/response.js";

export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await doctorService.getAllDoctors();
    const mapped = doctors.map(d => ({
      id: d._id,
      _id: d._id,
      name: d.name,
      specialization: d.specialization,
      consultantType: d.consultantType || "doctor",
      roomNumber: d.roomNumber,
      consultationFee: d.consultationFee,
    }));
    res.json(generateResponse(mapped, "Doctors fetched successfully"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};

export const getDoctorById = async (req, res) => {
  try {
    const doctor = await doctorService.getDoctorById(req.params.id);
    if (!doctor) {
      return res.status(404).json(generateError("Doctor not found"));
    }
    res.json(generateResponse({ doctor }, "Doctor fetched successfully"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};

export const createDoctor = async (req, res) => {
  try {
    const doctor = await doctorService.createDoctor(req.body);
    res.status(201).json(generateResponse({ doctor }, "Doctor created successfully"));
  } catch (error) {
    res.status(400).json(generateError(error.message));
  }
};

export const updateDoctor = async (req, res) => {
  try {
    const doctor = await doctorService.updateDoctor(req.params.id, req.body);
    res.json(generateResponse({ doctor }, "Doctor updated successfully"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};

export const deletDoctor = async (req, res) => {
  try {
    await doctorService.deleteDoctor(req.params.id);
    res.json(generateResponse({}, "Doctor deleted successfully"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};

export const getDoctorsBySpecialization = async (req, res) => {
  try {
    const { specialization } = req.params;
    const doctors = await doctorService.getDoctorsBySpecialization(specialization);
    const mapped = doctors.map(d => ({
      id: d._id,
      _id: d._id,
      name: d.name,
      specialization: d.specialization,
      consultantType: d.consultantType || "doctor",
      roomNumber: d.roomNumber,
      consultationFee: d.consultationFee,
    }));
    res.json(generateResponse(mapped, "Doctors fetched successfully"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};
