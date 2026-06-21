import mongoose from "mongoose";

const InventorySchema = new mongoose.Schema({
  medicineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Medicine",
    required: true,
  },
  currentStock: Number,
  minimumStock: Number,
  reorderLevel: Number,
  supplier: String,
  stockValue: Number,
  location: String,
});

export default mongoose.model("Inventory", InventorySchema,"inventory");