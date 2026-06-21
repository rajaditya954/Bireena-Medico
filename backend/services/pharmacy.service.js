import Medicine from "../models/Medicine.js";
import Inventory from "../models/Inventory.js";

class PharmacyService {
  async getAllMedicines(filters = {}) {
    return await Medicine.find(filters);
  }

  async getMedicineById(id) {
    return await Medicine.findById(id);
  }

  async searchMedicines(query) {
    return await Medicine.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { genericName: { $regex: query, $options: "i" } },
      ],
    });
  }

  async createMedicine(medicineData) {
    const medicine = new Medicine(medicineData);
    await medicine.save();
    return medicine;
  }

  async updateMedicine(id, updateData) {
    return await Medicine.findByIdAndUpdate(id, updateData, { new: true });
  }

  async getMedicineInventory(medicineId) {
    return await Inventory.findOne({ medicineId });
  }

  async getInventoryWithMedicines() {
  return await Inventory.find().populate("medicineId");
}
  async updateInventory(medicineId, quantityChange) {
    const inventory = await Inventory.findOne({ medicineId });
    if (!inventory) throw new Error("Inventory not found");

    inventory.quantity += quantityChange;
    await inventory.save();
    return inventory;
  }

  async checkStock(medicineId, requiredQuantity) {
    const inventory = await this.getMedicineInventory(medicineId);
    return inventory && inventory.quantity >= requiredQuantity;
  }

  async getLowStockMedicines() {
    return await Inventory.find({
      quantity: { $lte: "$minimumThreshold" },
    }).populate("medicineId");
  }
}

export default new PharmacyService();
