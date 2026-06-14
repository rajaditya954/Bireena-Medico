import patientService from "../services/patient.service.js";
import { generateResponse, generateError } from "../utils/response.js";

export const getAllPatients = async (req, res) => {
  try {
    const search = req.query.search;
    let filters = {};
    if (search) {
      filters = {
        $or: [
          { fullName: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } },
        ],
      };
    }
    const patients = await patientService.getAllPatients(filters);
    const mapped = patients.map((p) => ({
      id: p._id,
      name: p.fullName,
      phone: p.phone,
      fullName: p.fullName,
      _id: p._id,
      patientId: p.patientId || p._id,
      age: p.age,
      gender: p.gender,
      email: p.email,
      dob: p.dob,
      bloodGroup: p.bloodGroup,
      maritalStatus: p.maritalStatus,
      address: p.address,
      city: p.city,
      state: p.state,
      pincode: p.pincode,
      referredBy: p.referredBy,
      allergies: p.allergies || [],
      chronicDiseases: p.chronicDiseases || [],
      medicalHistory: p.medicalHistory || [],
      emergencyContact: p.emergencyContact || { name: "", relation: "", phone: "" },
      insuranceInfo: p.insuranceInfo || { provider: "", policyNumber: "" },
    }));
    res.json(generateResponse(mapped, "Patients fetched successfully"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};

export const getPatientById = async (req, res) => {
  try {
    const patient = await patientService.getPatientById(req.params.id);
    if (!patient) {
      return res.status(404).json(generateError("Patient not found"));
    }
    res.json(generateResponse({ patient }, "Patient fetched successfully"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};

export const createPatient = async (req, res) => {
  try {
    const { name, phone, ...rest } = req.body;
    const patientData = {
      fullName: name || req.body.fullName || "Unknown",
      phone: phone || req.body.phone,
      ...rest,
      patientId: await patientService.generateUHID(),
    };

    const patient = await patientService.createPatient(patientData);
    const mapped = {
      id: patient._id,
      name: patient.fullName,
      phone: patient.phone,
      fullName: patient.fullName,
      _id: patient._id,
    };
    res.status(201).json(generateResponse(mapped, "Patient created successfully"));
  } catch (error) {
    console.error("PATIENT CREATION ERROR:", error);
    res.status(400).json(generateError(error.message));
  }
};

export const updatePatient = async (req, res) => {
  try {
    const patient = await patientService.updatePatient(req.params.id, req.body);
    res.json(generateResponse({ patient }, "Patient updated successfully"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};

export const deletePatient = async (req, res) => {
  try {
    await patientService.deletePatient(req.params.id);
    res.json(generateResponse({}, "Patient deleted successfully"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};
