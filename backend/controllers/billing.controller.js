import billingService from "../services/billing.service.js";
import { generateResponse, generateError } from "../utils/response.js";

export const getAllBillings = async (req, res) => {
  try {
    const billings = await billingService.getAllBillings();
    res.json({ success: true, data: billings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createBilling = async (req, res) => {
  try {
    const billing = await billingService.createBilling(req.body);
    res.status(201).json(generateResponse({ billing }, "Billing created successfully"));
  } catch (error) {
    res.status(400).json(generateError(error.message));
  }
};

export const getBillingById = async (req, res) => {
  try {
    const billing = await billingService.getBillingById(req.params.id);
    if (!billing) {
      return res.status(404).json(generateError("Billing not found"));
    }
    res.json(generateResponse({ billing }, "Billing fetched successfully"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};

export const getPatientBillings = async (req, res) => {
  try {
    const billings = await billingService.getBillingsByPatient(req.params.patientId);
    res.json(generateResponse({ billings }, "Billings fetched successfully"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};

export const updateBillingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const billing = await billingService.updateBillingStatus(req.params.id, status);
    res.json(generateResponse({ billing }, "Billing status updated"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};

export const generateInvoice = async (req, res) => {
  try {
    const invoice = await billingService.generateInvoice(req.params.billingId);
    res.status(201).json(generateResponse({ invoice }, "Invoice generated successfully"));
  } catch (error) {
    res.status(400).json(generateError(error.message));
  }
};

export const getPendingBills = async (req, res) => {
  try {
    const bills = await billingService.getPendingBills(req.params.patientId);
    res.json(generateResponse({ bills }, "Pending bills fetched"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};
