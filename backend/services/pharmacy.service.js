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
        { medicineName: { $regex: query, $options: "i" } },
        { medicineCode: { $regex: query, $options: "i" } },
      ],
    });
  }

  async createMedicine(medicineData) {
    const medicineName = medicineData.medicineName || medicineData.name;
    const category = medicineData.category;
    const manufacturer = medicineData.manufacturer || medicineData.supplier || "Unknown";
    const mrp = Number(medicineData.mrp || 0);
    const unit = medicineData.unit || medicineData.unitType || "Tablet";
    const expiryDate = medicineData.expiryDate;
    const batchNo = medicineData.batchNo || medicineData.batchNumber || "B-" + Math.floor(Math.random() * 10000);
    const medicineCode = medicineData.medicineCode || medicineData.code || "MED-" + Math.random().toString(36).substring(2, 7).toUpperCase();

    const medicine = new Medicine({
      medicineCode,
      medicineName,
      category,
      manufacturer,
      mrp,
      unit,
      expiryDate,
      batchNo
    });
    await medicine.save();

    const currentStock = Number(medicineData.currentStock || 0);
    const reorderLevel = Number(medicineData.reorderLevel || 10);
    const supplier = medicineData.supplier || manufacturer;
    const location = medicineData.location || medicineData.warehouse || "Store";
    const stockValue = currentStock * mrp;

    const inventory = new Inventory({
      medicineId: medicine._id,
      currentStock,
      minimumStock: Number(medicineData.minimumStock || 10),
      reorderLevel,
      supplier,
      stockValue,
      location
    });
    await inventory.save();

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

  async updateInventoryItem(id, updateData) {
    const inventory = await Inventory.findById(id);
    if (!inventory) throw new Error("Inventory item not found");

    if (inventory.medicineId) {
      const medicineUpdates = {};
      if (updateData.mrp !== undefined || updateData.unitPrice !== undefined) {
        medicineUpdates.mrp = updateData.mrp !== undefined ? Number(updateData.mrp) : Number(updateData.unitPrice);
      }
      if (updateData.expiryDate !== undefined) {
        medicineUpdates.expiryDate = updateData.expiryDate;
      }
      if (updateData.batchNo !== undefined || updateData.batchNumber !== undefined) {
        medicineUpdates.batchNo = updateData.batchNo !== undefined ? updateData.batchNo : updateData.batchNumber;
      }
      if (updateData.medicineName !== undefined || updateData.name !== undefined) {
        medicineUpdates.medicineName = updateData.medicineName !== undefined ? updateData.medicineName : updateData.name;
      }
      if (updateData.category !== undefined) {
        medicineUpdates.category = updateData.category;
      }
      if (Object.keys(medicineUpdates).length > 0) {
        await Medicine.findByIdAndUpdate(inventory.medicineId, medicineUpdates);
      }
    }

    if (updateData.stock !== undefined || updateData.currentStock !== undefined) {
      inventory.currentStock = updateData.stock !== undefined ? Number(updateData.stock) : Number(updateData.currentStock);
    }
    if (updateData.reorderLevel !== undefined) {
      inventory.reorderLevel = Number(updateData.reorderLevel);
    }
    if (updateData.minimumStock !== undefined) {
      inventory.minimumStock = Number(updateData.minimumStock);
    }
    if (updateData.warehouse !== undefined || updateData.location !== undefined) {
      inventory.location = updateData.warehouse !== undefined ? updateData.warehouse : updateData.location;
    }
    if (updateData.supplier !== undefined) {
      inventory.supplier = updateData.supplier;
    }

    const activeMed = await Medicine.findById(inventory.medicineId);
    if (activeMed) {
      inventory.stockValue = inventory.currentStock * activeMed.mrp;
    }

    await inventory.save();
    return await Inventory.findById(id).populate("medicineId");
  }

  async deleteInventoryItem(id) {
    const inventory = await Inventory.findById(id);
    if (!inventory) throw new Error("Inventory item not found");
    if (inventory.medicineId) {
      await Medicine.findByIdAndDelete(inventory.medicineId);
    }
    return await Inventory.findByIdAndDelete(id);
  }
}

export default new PharmacyService();
