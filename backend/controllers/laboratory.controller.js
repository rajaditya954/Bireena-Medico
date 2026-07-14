import laboratoryService from "../services/laboratory.service.js";
import { uploadToLocal } from "../utils/localUpload.js";
import { generateResponse, generateError } from "../utils/response.js";
import { extractText, parseReportFields } from "../utils/documentExtractor.js";

// ---------- Tests ----------

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
    if (!req.body.testCode) {
      return res.status(400).json(generateError("Test code is required"));
    }
    const existing = await laboratoryService.getTestByCode(req.body.testCode);
    if (existing) {
      return res.status(400).json(generateError(`Test code "${req.body.testCode}" already exists`));
    }
    const test = await laboratoryService.createTest(req.body);
    res.status(201).json(generateResponse({ test }, "Test created successfully"));
  } catch (error) {
    res.status(400).json(generateError(error.message));
  }
};

export const updateTest = async (req, res) => {
  try {
    if (req.body.testCode) {
      const existing = await laboratoryService.getTestByCode(req.body.testCode);
      if (existing && existing._id.toString() !== req.params.id) {
        return res.status(400).json(generateError(`Test code "${req.body.testCode}" already exists`));
      }
    }
    const test = await laboratoryService.updateTest(req.params.id, req.body);
    res.json(generateResponse({ test }, "Test updated successfully"));
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json(generateError(`Test code "${req.body.testCode}" already exists`));
    }
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

// ---------- Reports ----------

export const createLabReport = async (req, res) => {
  try {
    const reportData = {};

    // Core fields
    if (req.body.status) reportData.status = req.body.status;
    if (req.body.remarks) reportData.remarks = req.body.remarks;
    if (req.body.findings) reportData.findings = req.body.findings;
    if (req.body.sampleDate) reportData.sampleDate = req.body.sampleDate;
    if (req.body.reportDate) reportData.reportDate = req.body.reportDate;
    if (req.body.patientId) reportData.patientId = req.body.patientId;

    // New metadata fields
    if (req.body.priority) reportData.priority = req.body.priority;
    if (req.body.sampleType) reportData.sampleType = req.body.sampleType;
    if (req.body.department) reportData.department = req.body.department;
    if (req.body.sampleCollectionTime) reportData.sampleCollectionTime = req.body.sampleCollectionTime;
    if (req.body.uploadedBy) reportData.uploadedBy = req.body.uploadedBy;
    if (req.body.sampleId) reportData.sampleId = req.body.sampleId;

    if (req.body.tests) {
      const testIds = req.body.tests.split(",").map((t) => t.trim()).filter(Boolean);
      reportData.tests = testIds;
    }

    const report = await laboratoryService.createReport(reportData);

    // Handle single file upload (backwards compatible)
    if (req.file) {
      const { url } = await uploadToLocal(req.file, report.reportId);
      await laboratoryService.updateReport(report._id, {
        reportFile: url,
        uploadedTime: new Date(),
      });
      report.reportFile = url;
    }

    // Handle multiple file uploads
    if (req.files && req.files.length > 0) {
      const attachments = [];
      for (const file of req.files) {
        const { url } = await uploadToLocal(file, `${report.reportId}_${Date.now()}`);
        attachments.push({
          filename: file.filename || file.originalname,
          originalName: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          path: url,
          category: req.body.attachmentCategory || "Report",
          uploadedAt: new Date(),
        });
      }
      if (attachments.length > 0) {
        await laboratoryService.addAttachments(report._id, attachments);
      }
    }

    res.status(201).json(generateResponse({ report }, "Lab report created successfully"));
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json(generateError("Report ID already exists. Please try again."));
    }
    console.error("[createLabReport] Error:", error);
    res.status(400).json(generateError(error.message));
  }
};

export const getAllReports = async (req, res) => {
  try {
    const reports = await laboratoryService.getAllReports();
    res.json(generateResponse({ reports }, "Reports fetched successfully"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
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

export const updateReport = async (req, res) => {
  try {
    const existingReport = await laboratoryService.getReportById(req.params.id);
    if (!existingReport) {
      return res.status(404).json(generateError("Report not found"));
    }

    const update = {};

    // Handle single file
    if (req.file) {
      const { url } = await uploadToLocal(req.file, existingReport.reportId);
      update.reportFile = url;
      update.uploadedTime = new Date();
    }

    if (req.body.status) update.status = req.body.status;
    if (req.body.remarks !== undefined) update.remarks = req.body.remarks;
    if (req.body.findings !== undefined) update.findings = req.body.findings;
    if (req.body.patientId) update.patientId = req.body.patientId;
    if (req.body.sampleDate) update.sampleDate = req.body.sampleDate;
    if (req.body.reportDate) update.reportDate = req.body.reportDate;

    // New metadata fields
    if (req.body.priority) update.priority = req.body.priority;
    if (req.body.sampleType) update.sampleType = req.body.sampleType;
    if (req.body.department) update.department = req.body.department;
    if (req.body.sampleCollectionTime) update.sampleCollectionTime = req.body.sampleCollectionTime;
    if (req.body.uploadedBy) update.uploadedBy = req.body.uploadedBy;
    if (req.body.reportVersion) update.reportVersion = parseInt(req.body.reportVersion, 10);

    if (req.body.tests) {
      update.tests = req.body.tests.split(",").map((t) => t.trim()).filter(Boolean);
    }

    // Handle multiple files
    if (req.files && req.files.length > 0) {
      const attachments = [];
      for (const file of req.files) {
        const { url } = await uploadToLocal(file, `${existingReport.reportId}_${Date.now()}`);
        attachments.push({
          filename: file.filename || file.originalname,
          originalName: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          path: url,
          category: req.body.attachmentCategory || "Report",
          uploadedAt: new Date(),
        });
      }
      if (attachments.length > 0) {
        await laboratoryService.addAttachments(req.params.id, attachments);
      }
    }

    const report = await laboratoryService.updateReport(req.params.id, update);
    res.json(generateResponse({ report }, "Report updated successfully"));
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json(generateError("Report ID already exists. Please try again."));
    }
    console.error("[updateReport] Error:", error);
    res.status(400).json(generateError(error.message));
  }
};

export const approveReport = async (req, res) => {
  try {
    const report = await laboratoryService.updateReportStatus(req.params.id, "APPROVED");
    res.json(generateResponse({ report }, "Report approved successfully"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};

export const verifyReport = async (req, res) => {
  try {
    const { verifierName } = req.body;
    if (!verifierName) {
      return res.status(400).json(generateError("Verifier name is required"));
    }
    const report = await laboratoryService.verifyReport(req.params.id, verifierName);
    res.json(generateResponse({ report }, "Report verified successfully"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};

export const releaseReport = async (req, res) => {
  try {
    const report = await laboratoryService.releaseReport(req.params.id);
    res.json(generateResponse({ report }, "Report released to patient"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};

export const deleteReport = async (req, res) => {
  try {
    await laboratoryService.deleteReport(req.params.id);
    res.json(generateResponse({}, "Report deleted successfully"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};

export const extractReport = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json(generateError("No file uploaded"));
    }
    const text = await extractText(req.file.buffer, req.file.mimetype);
    const fields = parseReportFields(text);
    res.json(generateResponse(fields, "Report extracted successfully"));
  } catch (error) {
    res.status(400).json(generateError(error.message));
  }
};
