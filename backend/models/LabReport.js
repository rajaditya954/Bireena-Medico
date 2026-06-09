import mongoose from "mongoose";

const LabReportSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    testId: { type: mongoose.Schema.Types.ObjectId, ref: "LabTest", required: true },
    orderedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
    sampleCollectionDate: { type: Date },
    reportGeneratedDate: { type: Date },
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed", "approved"],
      default: "pending",
    },
    result: { type: String }, // normal, abnormal, critical
    reportUrl: { type: String }, // PDF URL
    remarks: { type: String },
    attachments: [{ type: String }], // URLs
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("LabReport", LabReportSchema);
