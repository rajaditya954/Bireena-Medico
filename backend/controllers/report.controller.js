import reportService from "../services/report.service.js";
import { generateResponse, generateError } from "../utils/response.js";

export const getLabReports = async (req, res) => {
  try {
    const { patientId, status } = req.query;
    const filters = {};
    if (patientId) filters.patientId = patientId;
    if (status) filters.status = status;

    const reports = await reportService.getLabReports(filters);
    res.json(generateResponse({ reports }, "Reports fetched successfully"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};

export const getReportById = async (req, res) => {
  try {
    const report = await reportService.getReportById(req.params.id);
    if (!report) {
      return res.status(404).json(generateError("Report not found"));
    }
    res.json(generateResponse({ report }, "Report fetched successfully"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};

export const createLabReport = async (req, res) => {
  try {
    const report = await reportService.createLabReport(req.body);
    res.status(201).json(generateResponse({ report }, "Report created successfully"));
  } catch (error) {
    res.status(400).json(generateError(error.message));
  }
};

export const updateReportStatus = async (req, res) => {
  try {
    const { status, remarks } = req.body;
    const report = await reportService.updateReportStatus(req.params.id, status, remarks);
    res.json(generateResponse({ report }, "Report status updated"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};

export const getAuditLogs = async (req, res) => {
  try {
    const { userId, action, resource } = req.query;
    const filters = {};
    if (userId) filters.userId = userId;
    if (action) filters.action = action;
    if (resource) filters.resource = resource;

    const logs = await reportService.getAuditLogs(filters);
    res.json(generateResponse({ logs }, "Audit logs fetched successfully"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};
