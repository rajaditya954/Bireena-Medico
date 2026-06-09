import pharmacyService from "../services/pharmacy.service.js";
import { generateResponse, generateError } from "../utils/response.js";

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
