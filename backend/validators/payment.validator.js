import joi from "joi";

export const paymentSchema = joi.object({
  invoiceId: joi.string().required(),
  patientId: joi.string().required(),
  amount: joi.number().required().min(0),
  paymentMethod: joi.string().valid("credit_card", "debit_card", "upi", "net_banking", "cash", "razorpay"),
  transactionId: joi.string(),
  razorpayPaymentId: joi.string(),
  razorpayOrderId: joi.string(),
  status: joi.string().valid("pending", "success", "failed", "refunded"),
});

export const validatePaymentInput = (req, res, next) => {
  const { error, value } = paymentSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errorMessages = error.details.map((detail) => ({
      field: detail.path.join("."),
      message: detail.message,
    }));
    return res.status(400).json({ error: "Validation failed", details: errorMessages });
  }

  req.body = value;
  next();
};
