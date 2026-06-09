import LabTest from "../models/LabTest.js";
import LabReport from "../models/LabReport.js";

class LaboratoryService {
  async getAllTests(filters = {}) {
    return await LabTest.find(filters);
  }

  async getTestById(id) {
    return await LabTest.findById(id);
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

  async getTestsByCategory(category) {
    return await LabTest.find({ category });
  }

  async createReport(reportData) {
    const report = new LabReport(reportData);
    await report.save();
    return await report.populate(["patientId", "testId", "orderedBy"]);
  }

  async getReportById(id) {
    return await LabReport.findById(id).populate(["patientId", "testId", "orderedBy"]);
  }

  async getReportsByPatient(patientId) {
    return await LabReport.find({ patientId }).populate("testId");
  }

  async updateReportStatus(id, status, remarks) {
    return await LabReport.findByIdAndUpdate(
      id,
      { status, remarks, reportGeneratedDate: new Date() },
      { new: true }
    ).populate(["patientId", "testId"]);
  }

  async approveReport(id, approvedBy) {
    return await LabReport.findByIdAndUpdate(
      id,
      { status: "approved", approvedBy },
      { new: true }
    );
  }
}

export default new LaboratoryService();
