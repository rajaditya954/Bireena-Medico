import laboratoryService from "../services/laboratory.service.js";
import { generateResponse, generateError } from "../utils/response.js";

export const getAllTests = async (req, res) => {
  try {
    const tests = await laboratoryService.getAllTests();
    res.json(generateResponse({ tests }, "Tests fetched successfully"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};

export const getTestById = async (req, res) => {
  try {
    const test = await laboratoryService.getTestById(req.params.id);
    if (!test) {
      return res.status(404).json(generateError("Test not found"));
    }
    res.json(generateResponse({ test }, "Test fetched successfully"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};

export const createTest = async (req, res) => {
  try {
    const test = await laboratoryService.createTest(req.body);
    res.status(201).json(generateResponse({ test }, "Test created successfully"));
  } catch (error) {
    res.status(400).json(generateError(error.message));
  }
};

export const updateTest = async (req, res) => {
  try {
    const test = await laboratoryService.updateTest(req.params.id, req.body);
    res.json(generateResponse({ test }, "Test updated successfully"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};

export const deleteTest = async (req, res) => {
  try {
    await laboratoryService.deleteTest(req.params.id);
    res.json(generateResponse({}, "Test deleted successfully"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};

export const createLabReport = async (req, res) => {
  try {
    const report = await laboratoryService.createReport(req.body);
    res.status(201).json(generateResponse({ report }, "Lab report created successfully"));
  } catch (error) {
    res.status(400).json(generateError(error.message));
  }
};

export const getReportsByPatient = async (req, res) => {
  try {
    const reports = await laboratoryService.getReportsByPatient(req.params.patientId);
    res.json(generateResponse({ reports }, "Reports fetched successfully"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};

export const updateReportStatus = async (req, res) => {
  try {
    const { status, remarks } = req.body;
    const report = await laboratoryService.updateReportStatus(req.params.id, status, remarks);
    res.json(generateResponse({ report }, "Report status updated"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};

export const approveReport = async (req, res) => {
  try {
    const report = await laboratoryService.approveReport(req.params.id, req.user.id);
    res.json(generateResponse({ report }, "Report approved successfully"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};
