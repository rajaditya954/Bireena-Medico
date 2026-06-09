import LabReport from "../models/LabReport.js";
import AuditLog from "../models/AuditLog.js";

class ReportService {
  async getLabReports(filters = {}) {
    return await LabReport.find(filters)
      .populate(["patientId", "testId", "orderedBy", "approvedBy"]);
  }

  async getReportById(id) {
    return await LabReport.findById(id).populate(["patientId", "testId", "orderedBy"]);
  }

  async createLabReport(reportData) {
    const report = new LabReport(reportData);
    await report.save();
    return await report.populate(["patientId", "testId"]);
  }

  async updateReportStatus(id, status, remarks) {
    return await LabReport.findByIdAndUpdate(
      id,
      { status, remarks, reportGeneratedDate: new Date() },
      { new: true }
    ).populate(["patientId", "testId"]);
  }

  async generateAuditLog(userId, action, resource, resourceId, oldValues, newValues) {
    const log = new AuditLog({
      userId,
      action,
      resource,
      resourceId,
      oldValues,
      newValues,
    });

    await log.save();
    return log;
  }

  async getAuditLogs(filters = {}) {
    return await AuditLog.find(filters)
      .populate("userId")
      .sort({ createdAt: -1 });
  }
}

export default new ReportService();
