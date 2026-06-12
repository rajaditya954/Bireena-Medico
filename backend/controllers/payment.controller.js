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
export const createOrder = async (req, res) => {
  try {
    const { amount, currency = "INR", receipt } = req.body;

    // Import razorpay instance
    import("../config/razorpay.js").then((module) => {
      const razorpay = module.default;
      
      if (!razorpay) {
        return res.status(500).json({ error: "Razorpay not configured" });
      }

      const options = {
        amount: amount * 100, // Convert to paise (e.g., ₹500 → 50000 paise)
        currency,
        receipt: receipt || `receipt_${Date.now()}`,
        payment_capture: 1, // Auto capture payment
      };

      razorpay.orders.create(options, (err, order) => {
        if (err) {
          console.error("Razorpay order creation error:", err);
          return res.status(500).json({ error: err.message });
        }
        res.json({ success: true, order });
      });
    });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ error: error.message });
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
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
    const paymentId = req.params.paymentId;       // ✅ Use URL param

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return res.status(400).json(generateError("Missing razorpay verification fields"));
    }

    const isValid = await paymentService.verifyRazorpayPayment(
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature
    );

    if (isValid) {
      const payment = await paymentService.updatePaymentStatus(paymentId, "success");
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