import pharmacyService from "../services/pharmacy.service.js";
import { generateResponse, generateError } from "../utils/response.js";
import Medicine from "../models/Medicine.js";
import Inventory from "../models/Inventory.js";
import MedicineRequirement from "../models/MedicineRequirement.js";
import History from "../models/History.js";



export const getAllMedicines = async (req, res) => {
  try {
    const medicines = await pharmacyService.getAllMedicines();
    res.json(generateResponse({ medicines }, "Medicines fetched successfully"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};

export const getMedicineById = async (req, res) => {
  try {
    const medicine = await pharmacyService.getMedicineById(req.params.id);
    if (!medicine) {
      return res.status(404).json(generateError("Medicine not found"));
    }
    res.json(generateResponse({ medicine }, "Medicine fetched successfully"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};

export const searchMedicines = async (req, res) => {
  try {
    const { query } = req.query;
    const medicines = await pharmacyService.searchMedicines(query);
    res.json(generateResponse({ medicines }, "Medicines fetched successfully"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};

export const createMedicine = async (req, res) => {
  try {
    const medicine = await pharmacyService.createMedicine(req.body);
    res.status(201).json(generateResponse({ medicine }, "Medicine created successfully"));
  } catch (error) {
    res.status(400).json(generateError(error.message));
  }
};

export const updateMedicine = async (req, res) => {
  try {
    const medicine = await pharmacyService.updateMedicine(req.params.id, req.body);
    res.json(generateResponse({ medicine }, "Medicine updated successfully"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};

export const checkStock = async (req, res) => {
  try {
    const { medicineId, quantity } = req.query;
    const isInStock = await pharmacyService.checkStock(medicineId, parseInt(quantity));
    res.json(generateResponse({ inStock: isInStock }, "Stock check completed"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};

export const getLowStockMedicines = async (req, res) => {
  try {
    const medicines = await pharmacyService.getLowStockMedicines();
    res.json(generateResponse({ medicines }, "Low stock medicines fetched"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const medicines = await Medicine.countDocuments();

    const inventory = await Inventory.find().populate("medicineId");

    const stockValue = inventory.reduce(
      (sum, item) => sum + (item.stockValue || 0),
      0
    );

    const lowStock = inventory.filter(
      item => item.currentStock <= item.minimumStock
    ).length;

    const requirements =
      await MedicineRequirement.countDocuments({
        status: "PENDING"
      });

    res.json({
      medicines,
      stockValue,
      lowStock,
      requirements
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getInventoryWithMedicines = async (req, res) => {
  try {
    const inventory = await pharmacyService.getInventoryWithMedicines();

    res.json(
      generateResponse(
        { inventory },
        "Inventory fetched successfully"
      )
    );
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};

export const getRequirements = async (req, res) => {
  try {
    const requirements = await MedicineRequirement.find()
      .populate("medicineId")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: requirements
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getStockAlerts = async (req, res) => {
  try {
    const alerts = await Inventory.find({
      $expr: {
        $lte: ["$currentStock", "$reorderLevel"]
      }
    }).populate("medicineId");

    res.json({
      success: true,
      data: alerts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getExpiryAlerts = async (req, res) => {
  const medicines = await Medicine.find({
    expiryDate: {
      $exists: true
    }
  });

  res.json({
    success: true,
    data: medicines
  });
}

export const getRecentMedicines = async (req, res) => {
  const medicines =
    await Medicine.find()
      .sort({ createdAt: -1 })
      .limit(5);

  res.json({
    success: true,
    data: medicines
  });
}
export const getCategoryCounts =
  async (req, res) => {

    const categories =
      await Medicine.aggregate([
        {
          $group: {
            _id: "$category",
            count: { $sum: 1 }
          }
        }
      ]);

    res.json({
      success: true,
      data: categories
    });
  }

export const getInventoryStats = async (req, res) => {
  try {
    const inventory = await Inventory.find();

    const totalItems = inventory.length;

    const totalValue = inventory.reduce(
      (sum, item) => sum + item.stockValue,
      0
    );

    const lowStock = inventory.filter(
      item =>
        item.currentStock > 0 &&
        item.currentStock <= item.reorderLevel
    ).length;

    const outOfStock = inventory.filter(
      item => item.currentStock === 0
    ).length;

    res.json({
      success: true,
      data: {
        totalItems,
        totalValue,
        lowStock,
        outOfStock
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const removeMedicineFromRequirement = async (req, res) => {
  try {
    const { requirementId, medicineId } = req.params;

    const requirement = await MedicineRequirement.findByIdAndUpdate(
      requirementId,
      {
        $pull: {
          medicines: {
            _id: medicineId
          }
        }
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: requirement
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const createRequirement = async (req, res) => {
  try {
    const {
      patientId,
      medicines,
      requestedMedicines
    } = req.body;

    const saved = [];
    

     for(const med of medicines) {
      console.log("MED:", med);

  const item = await MedicineRequirement.create({

    requirementId:
      "REQ" +
      Date.now() +
      Math.floor(Math.random() * 10000),

    patientId,

    medicineId: med.medicineId,

    requestedQty: med.quantity,

    notes: med.notes || ""
  });

  saved.push(item);
}

    for (const med of requestedMedicines) {

  if (!med.name || med.quantity <= 0) {
    continue;
  }
  const item = await MedicineRequirement.create({

    requirementId:
      "REQ" +
      Date.now() +
      Math.floor(Math.random() * 10000),

    patientId,

    requestedMedicineName: med.name,

    strength: med.strength,

    unitType: med.unitType,

    requestedQty: med.quantity,

    notes: med.notes || ""

  });

  saved.push(item);
}

    await History.create({
      patientId,
      medicines,
      requestedMedicines,
      total: req.body.total,
      paymentMethod: req.body.paymentMethod,
      amountPaid: req.body.amountPaid,
    });
    console.log("History Saved");
    res.status(201).json({
      success: true,
      data: saved
    });

  } catch (error) {

    console.error("CREATE REQUIREMENT ERROR:");

    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
      stack: error.stack
    });
  };
};

export const getRequirementsByPatient = async (req, res) => {
  try {

    const requirements =
      await MedicineRequirement.find({
        patientId: req.params.patientId
      }).populate("medicineId");

    res.status(200).json({
      success: true,
      data: requirements
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

export const getHistory = async (req, res) => {
  try {
    const history = await History.find()
      .populate("patientId")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: history
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};