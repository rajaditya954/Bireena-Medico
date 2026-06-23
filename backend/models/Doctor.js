import db from "../config/db-client.js";

const DoctorSchema = new db.Schema(
  {
    userId: { type: db.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    doctorCode: { type: String, unique: true, index: true },
    name: { type: String, required: true },
    specialization: { type: String, required: true },
    consultantType: { type: String, enum: ["doctor", "lab"], default: "doctor" },
    qualification: { type: String },
    description: { type: String },
    qualifications: [{ type: String }],
    registrationNumber: { type: String, unique: true, default: () => `REG${Date.now().toString(36)}${Math.floor(Math.random()*10000)}` },
    experience: { type: Number }, // years
    consultationFee: { type: Number, default: 500 },
    roomNumber: { type: String },
    schedule: [
      {
        day: String,
        startTime: String,
        endTime: String,
        isAvailable: { type: Boolean, default: true },
      },
    ],
    clinic: {
      name: String,
      address: String,
      phone: String,
    },
    isVerified: { type: Boolean, default: false },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalConsultations: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default db.model("Doctor", DoctorSchema);
