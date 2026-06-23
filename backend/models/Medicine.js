import db from "../config/db-client.js";

const MedicineSchema = new db.Schema(
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

export default db.model(
  "Medicine",
  MedicineSchema
);
