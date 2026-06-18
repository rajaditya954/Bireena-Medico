import LabTest from "../models/LabTest.js";
import LabReport from "../models/LabReport.js";
import { deleteFromLocal } from "../utils/localUpload.js";

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

  async createReport(reportData) {
    if (!reportData.history) {
      reportData.history = [{ event: "Report created", date: new Date() }];
    }
    const report = new LabReport(reportData);
    await report.save();
    return await report.populate(["patientId", "doctorId", "technicianId", "tests"]);
  }

  async getReportById(id) {
    return await LabReport.findById(id).populate(["patientId", "doctorId", "technicianId", "tests"]);
  }

  async getAllReports() {
    return await LabReport.find()
      .populate(["patientId", "doctorId", "technicianId", "tests"]);
  }

  async getReportsByPatient(patientId) {
    return await LabReport.find({ patientId }).populate(["tests"]);
  }

  async updateReportStatus(id, status, remarks) {
    const update = { $set: { status } };
    const statusLabels = {
      PENDING: "Marked as Pending",
      IN_PROGRESS: "Processing started",
      COMPLETED: "Report completed",
      APPROVED: "Report approved",
      CANCELLED: "Report cancelled",
    };
    update.$push = {
      history: {
        event: statusLabels[status] || `Status changed to ${status}`,
        date: new Date(),
      },
    };
    if (remarks !== undefined) update.$set.remarks = remarks;
    return await LabReport.findByIdAndUpdate(id, update, { new: true }).populate([
      "patientId",
      "doctorId",
      "technicianId",
      "tests",
    ]);
  }

  async updateReport(id, updateData) {
    const update = { $set: updateData };
    const ops = [];
    if (updateData.reportFile) {
      ops.push({ event: "Report file uploaded", date: new Date() });
    }
    if (updateData.status) {
      const statusLabels = {
        PENDING: "Marked as Pending",
        IN_PROGRESS: "Processing started",
        COMPLETED: "Report completed",
        APPROVED: "Report approved",
        CANCELLED: "Report cancelled",
      };
      ops.push({ event: statusLabels[updateData.status] || `Status changed to ${updateData.status}`, date: new Date() });
    }
    if (ops.length > 0) {
      update.$push = { history: { $each: ops } };
    }
    return await LabReport.findByIdAndUpdate(id, update, { new: true }).populate([
      "patientId",
      "doctorId",
      "technicianId",
      "tests",
    ]);
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
