import LabTest from "../models/LabTest.js";
import LabReport from "../models/LabReport.js";
import { deleteFromLocal } from "../utils/localUpload.js";

const POPULATE_FIELDS = ["patientId", "doctorId", "technicianId", "tests"];

const STATUS_LABELS = {
  PENDING: "Marked as Pending",
  REQUESTED: "Lab test requested",
  SAMPLE_COLLECTED: "Sample collected",
  SAMPLE_RECEIVED: "Sample received in lab",
  IN_TESTING: "Testing started",
  IN_PROGRESS: "Processing started",
  READY: "Testing completed — report ready",
  UPLOADED: "Report uploaded",
  VERIFIED: "Report verified by senior staff",
  APPROVED: "Report approved",
  COMPLETED: "Released to patient",
  CANCELLED: "Report cancelled",
};

class LaboratoryService {
  async getAllTests(filters = {}) {
    return await LabTest.find(filters);
  }

  async getTestById(id) {
    return await LabTest.findById(id);
  }

  async getTestByCode(testCode) {
    return await LabTest.findOne({ testCode: testCode.toUpperCase() });
  }

  async getTestsByCategory(category) {
    return await LabTest.find({ category });
  }

  async createTest(testData) {
    const test = new LabTest(testData);
    await test.save();
    return test;
  }

  async updateTest(id, updateData) {
    return await LabTest.findByIdAndUpdate(id, updateData, { new: true });
  }

  async deleteTest(id) {
    return await LabTest.findByIdAndDelete(id);
  }

  // --------------- Reports ---------------

  async createReport(reportData) {
    if (!reportData.history) {
      reportData.history = [{ event: "Report created", date: new Date() }];
    }
    if (!reportData.sampleId) {
      const last = await LabReport.findOne({ sampleId: /^SMP-\d+$/ })
        .sort({ sampleId: -1 })
        .lean();
      let nextNum = 1001;
      if (last?.sampleId) {
        const match = last.sampleId.match(/SMP-(\d+)/);
        if (match) nextNum = parseInt(match[1], 10) + 1;
      }
      reportData.sampleId = `SMP-${nextNum}`;
    }
    const report = new LabReport(reportData);
    await report.save();
    return await report.populate(POPULATE_FIELDS);
  }

  async getReportById(id) {
    return await LabReport.findById(id).populate(POPULATE_FIELDS);
  }

  async getAllReports() {
    return await LabReport.find().populate(POPULATE_FIELDS);
  }

  async getReportsByPatient(patientId) {
    return await LabReport.find({ patientId }).populate(["tests"]);
  }

  async updateReportStatus(id, status, remarks) {
    const update = { $set: { status } };
    update.$push = {
      history: {
        event: STATUS_LABELS[status] || `Status changed to ${status}`,
        date: new Date(),
      },
    };
    if (remarks !== undefined) update.$set.remarks = remarks;
    return await LabReport.findByIdAndUpdate(id, update, { new: true }).populate(POPULATE_FIELDS);
  }

  async updateReport(id, updateData) {
    const update = { $set: updateData };
    const ops = [];
    if (updateData.reportFile) {
      ops.push({ event: "Report file uploaded", date: new Date() });
    }
    if (updateData.status) {
      ops.push({
        event: STATUS_LABELS[updateData.status] || `Status changed to ${updateData.status}`,
        date: new Date(),
      });
    }
    if (ops.length > 0) {
      update.$push = { history: { $each: ops } };
    }
    return await LabReport.findByIdAndUpdate(id, update, { new: true }).populate(POPULATE_FIELDS);
  }

  async verifyReport(id, verifierName) {
    const update = {
      $set: {
        status: "VERIFIED",
        verifierName,
        verificationTimestamp: new Date(),
      },
      $push: {
        history: {
          event: `Report verified by ${verifierName}`,
          date: new Date(),
          by: verifierName,
        },
      },
    };
    return await LabReport.findByIdAndUpdate(id, update, { new: true }).populate(POPULATE_FIELDS);
  }

  async releaseReport(id) {
    const update = {
      $set: {
        status: "COMPLETED",
        reportDate: new Date(),
      },
      $push: {
        history: {
          event: "Released to patient & patient notified",
          date: new Date(),
        },
      },
    };
    return await LabReport.findByIdAndUpdate(id, update, { new: true }).populate(POPULATE_FIELDS);
  }

  async addAttachments(id, attachments) {
    return await LabReport.findByIdAndUpdate(
      id,
      {
        $push: {
          attachments: { $each: attachments },
          history: { event: `${attachments.length} attachment(s) added`, date: new Date() },
        },
      },
      { new: true }
    ).populate(POPULATE_FIELDS);
  }

  async deleteReport(id) {
    const report = await LabReport.findById(id);
    if (report?.reportFile) {
      await deleteFromLocal(report.reportFile);
    }
    return await LabReport.findByIdAndDelete(id);
  }
}

export default new LaboratoryService();
