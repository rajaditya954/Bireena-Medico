import paymentService from "../services/payment.service.js";
import { generateResponse, generateError } from "../utils/response.js";

export const createPayment = async (req, res) => {
  try {
    const payment = await paymentService.createPayment(req.body);
    res.status(201).json(generateResponse({ payment }, "Payment created successfully"));
  } catch (error) {
    res.status(400).json(generateError(error.message));
  }
};

export const getPaymentById = async (req, res) => {
  try {
    const payment = await paymentService.getPaymentById(req.params.id);
    if (!payment) {
      return res.status(404).json(generateError("Payment not found"));
    }
    res.json(generateResponse({ payment }, "Payment fetched successfully"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};

export const getPatientPayments = async (req, res) => {
  try {
    const payments = await paymentService.getPaymentsByPatient(req.params.patientId);
    res.json(generateResponse({ payments }, "Payments fetched successfully"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpayPaymentId, razorpayOrderId, signature } = req.body;
    const verified = await paymentService.verifyRazorpayPayment(razorpayPaymentId, razorpayOrderId, signature);
    
    if (verified) {
      const payment = await paymentService.updatePaymentStatus(req.body.paymentId, "success");
      res.json(generateResponse({ payment }, "Payment verified successfully"));
    } else {
      res.status(400).json(generateError("Payment verification failed"));
    }
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};

export const refundPayment = async (req, res) => {
  try {
    const { amount } = req.body;
    const refund = await paymentService.processRefund(req.params.paymentId, amount);
    res.json(generateResponse({ refund }, "Refund processed successfully"));
  } catch (error) {
    res.status(400).json(generateError(error.message));
  }
};

export const getPaymentStatistics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const stats = await paymentService.getPaymentStatistics(new Date(startDate), new Date(endDate));
    res.json(generateResponse({ stats }, "Payment statistics fetched"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};
