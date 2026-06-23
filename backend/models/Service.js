import db from "../config/db-client.js";


const ServiceSchema = new db.Schema(
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

export default db.model("Service", ServiceSchema);
