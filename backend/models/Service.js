import mongoose from "mongoose";

const ServiceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
    category: { type: String }, // e.g., "Consultation", "Lab Test", "Procedure"
    price: { type: Number, required: true },
    duration: { type: Number }, // minutes
    icon: String,
    isActive: { type: Boolean, default: true },
    serviceItems: [
      {
        name: String,
        price: Number,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Service", ServiceSchema);
