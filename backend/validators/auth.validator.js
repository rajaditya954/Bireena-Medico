import joi from "joi";

export const registerSchema = joi.object({
  name: joi.string().required().min(2).max(50),
  email: joi.string().email().required(),
  password: joi.string().required().min(6),
  role: joi.string().valid("patient", "doctor", "nurse", "billing", "admin"),
});

export const loginSchema = joi.object({
  email: joi.string().email().required(),
  password: joi.string().required(),
});

export const validateAuthInput = (req, res, next) => {
  let schema;
  
  if (req.path === "/register") {
    schema = registerSchema;
  } else if (req.path === "/login") {
    schema = loginSchema;
  } else {
    return next();
  }

  const { error, value } = schema.validate(req.body, {
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
