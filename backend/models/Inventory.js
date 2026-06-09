import mongoose from "mongoose";

const InventorySchema = new mongoose.Schema(
  {
    medicineId: { type: mongoose.Schema.Types.ObjectId, ref: "Medicine", required: true },
    quantity: { type: Number, required: true, default: 0 },
    minimumThreshold: { type: Number, default: 50 },
    maximumCapacity: { type: Number, default: 500 },
    batchNumber: { type: String },
    expiryDate: { type: Date },
    suppliedBy: { type: String },
    costPrice: { type: Number },
    sellingPrice: { type: Number },
    lastRestockedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("Inventory", InventorySchema);
