import db from "../config/db-client.js";

const PatientHistorySchema = new db.Schema(
  {
    patientId: { type: db.Schema.Types.ObjectId, ref: "Patient", required: true },
    doctorId: { type: db.Schema.Types.ObjectId, ref: "Doctor", required: true },
    appointmentId: { type: db.Schema.Types.ObjectId, ref: "Appointment", required: true },
    diagnosis: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

export default db.model("PatientHistory", PatientHistorySchema);
