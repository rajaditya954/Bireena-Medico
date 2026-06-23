import db from "../config/db-client.js";

const PrescriptionSchema = new db.Schema(
  {
    prescriptionId: { type: String, unique: true, index: true },
    appointmentId: { type: db.Schema.Types.ObjectId, ref: "Appointment", required: true },
    patientId: { type: db.Schema.Types.ObjectId, ref: "Patient", required: true },
    doctorId: { type: db.Schema.Types.ObjectId, ref: "Doctor", required: true },
    diagnosis: { type: String },
    symptoms: [{ type: String }],
    medicines: [
      {
        medicineId: { type: db.Schema.Types.ObjectId, ref: "Medicine" },
        medicineName: String,
        dosage: String,
        frequency: String,
        days: Number,
        quantity: Number,
        instructions: String,
      },
    ],
    advice: { type: String },
    followUpDate: { type: Date },
    notes: { type: String },
    fileUrl: { type: String }, // PDF or image URL
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default db.model("Prescription", PrescriptionSchema);
