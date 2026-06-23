import db from "../config/db-client.js";

const InventorySchema = new db.Schema({
  medicineId: {
    type: db.Schema.Types.ObjectId,
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

export default db.model("Inventory", InventorySchema,"inventory");
