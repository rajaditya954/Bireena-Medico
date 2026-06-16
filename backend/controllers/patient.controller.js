import patientService from "../services/patient.service.js";
import { generateResponse, generateError } from "../utils/response.js";


import Patient from "../models/patient.js";

export const getPatients = async (req,res)=>{
  const patients = await Patient.find().sort({createdAt:-1});

  res.status(200).json({
    success:true,
    data:patients
  });
};
export const getAllPatients = async (req, res) => {
  try {
    const patients = await patientService.getAllPatients();
    res.json(generateResponse({ patients }, "Patients fetched successfully"));
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
    const patientData = {
      ...req.body,
      uhid: await patientService.generateUHID(),
    };

    const patient = await patientService.createPatient(patientData);
    res.status(201).json(generateResponse({ patient }, "Patient created successfully"));
  } catch (error) {
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
