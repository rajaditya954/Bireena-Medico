import joi from "joi";

export const billingSchema = joi.object({
  patientId: joi.string().required(),
  items: joi.array().items(
    joi.object({
      description: joi.string(),
      quantity: joi.number().min(1),
      unitPrice: joi.number().min(0),
      total: joi.number().min(0),
    })
  ),
  subtotal: joi.number().required().min(0),
  tax: joi.number().min(0),
  discount: joi.number().min(0),
  totalAmount: joi.number().required().min(0),
  status: joi.string().valid("draft", "pending", "paid", "cancelled"),
});

export const validateBillingInput = (req, res, next) => {
  const { error, value } = billingSchema.validate(req.body, {
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
