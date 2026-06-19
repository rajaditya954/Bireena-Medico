import mongoose from "mongoose";

const HistorySchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient"
    },

    medicines: Array,

    requestedMedicines: Array,

    total: Number,

    paymentMethod: String,

    amountPaid: Number
  },
  {
    timestamps: true
  }
);

export default mongoose.model(
  "History",
  HistorySchema
);