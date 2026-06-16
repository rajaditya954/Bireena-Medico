import mongoose from "mongoose";

const MedicineSchema = new mongoose.Schema(
  {
    medicineCode: {
      type: String,
      required: true,
      unique: true,
    },

    medicineName: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
    },

    manufacturer: {
      type: String,
      required: true,
    },

    mrp: {
      type: Number,
      required: true,
    },

    unit: {
      type: String,
      required: true,
    },

    expiryDate: {
      type: Date,
    },

    batchNo: {
      type: String,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
  }
);

export default mongoose.model(
  "Medicine",
  MedicineSchema
);