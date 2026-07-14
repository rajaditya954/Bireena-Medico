import db from "../config/db-client.js";

const LabReportSchema = new db.Schema({
  reportId: { type: String, unique: true, index: true },
  patientId: { type: db.Schema.Types.ObjectId, ref: "Patient", required: true },
  doctorId: { type: db.Schema.Types.ObjectId, ref: "Doctor" },
  appointmentId: { type: db.Schema.Types.ObjectId, ref: "Appointment" },
  technicianId: { type: db.Schema.Types.ObjectId, ref: "User" },
  tests: [{ type: db.Schema.Types.ObjectId, ref: "LabTest" }],
  status: {
    type: String,
    enum: [
      "PENDING", "REQUESTED", "SAMPLE_COLLECTED", "SAMPLE_RECEIVED",
      "IN_TESTING", "READY", "UPLOADED", "VERIFIED",
      "COMPLETED", "IN_PROGRESS", "APPROVED", "CANCELLED",
    ],
    default: "PENDING",
  },
  sampleId: { type: String, index: true },
  sampleCollectionTime: { type: Date },
  sampleType: { type: String },
  department: { type: String },
  priority: {
    type: String,
    enum: ["NORMAL", "URGENT", "STAT"],
    default: "NORMAL",
  },
  sampleDate: { type: Date },
  reportDate: { type: Date },
  reportFile: { type: String },
  findings: { type: String },
  remarks: { type: String },
  uploadedBy: { type: String },
  uploadedTime: { type: Date },
  reportVersion: { type: Number, default: 1 },
  verifierName: { type: String },
  verificationTimestamp: { type: Date },
  attachments: [{
    filename: { type: String },
    originalName: { type: String },
    mimetype: { type: String },
    size: { type: Number },
    path: { type: String },
    category: { type: String },
    uploadedAt: { type: Date, default: Date.now },
  }],
  history: [{
    date: { type: Date, default: Date.now },
    event: { type: String, required: true },
    by: { type: String },
  }],
  createdAt: { type: Date, default: Date.now },
});

LabReportSchema.pre("save", async function (next) {
  if (this.reportId) return next();
  const last = await db.model("LabReport").findOne({ reportId: /^LAB\d+$/ }).sort({ reportId: -1 }).lean();
  let nextNum = 1001;
  if (last?.reportId) {
    const match = last.reportId.match(/LAB(\d+)/);
    if (match) nextNum = parseInt(match[1], 10) + 1;
  }
  this.reportId = `LAB${nextNum}`;
  next();
});

export default db.model("LabReport", LabReportSchema);
