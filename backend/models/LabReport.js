import mongoose from "mongoose";

const LabReportSchema = new mongoose.Schema(
  {
    reportId: { type: String, unique: true, index: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
    technicianId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    tests: [{ type: mongoose.Schema.Types.ObjectId, ref: "LabTest" }],
    status: {
      type: String,
      enum: [
        "pending",
        "in-progress",
        "completed",
        "approved",
        "PENDING",
        "IN_PROGRESS",
        "COMPLETED",
        "APPROVED",
        "CANCELLED",
      ],
      default: "pending",
    },
    sampleDate: { type: Date },
    reportDate: { type: Date },
    reportFile: { type: String },
    findings: { type: String },
    remarks: { type: String },
    reportUrl: { type: String },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("LabReport", LabReportSchema);
