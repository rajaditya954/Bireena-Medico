import mongoose from "mongoose";

const DoctorSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    licenseNumber: { type: String, required: true, unique: true },
    specialization: { type: String, required: true },
    qualifications: [{ type: String }],
    experience: { type: Number }, // years
    consultationFee: { type: Number, default: 500 },
    availableSlots: [
      {
        day: String,
        startTime: String,
        endTime: String,
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

export default mongoose.model("Doctor", DoctorSchema);
