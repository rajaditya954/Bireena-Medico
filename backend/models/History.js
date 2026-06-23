import db from "../config/db-client.js";

const HistorySchema = new db.Schema(
  {
    patientId: {
      type: db.Schema.Types.ObjectId,
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

export default db.model(
  "History",
  HistorySchema
);
