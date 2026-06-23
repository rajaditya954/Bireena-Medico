import joi from "joi";

const validRoles = [
  "ADMIN",
  "DOCTOR",
  "RECEPTIONIST",
  "LAB",
  "LAB_ASSISTANT",
  "PHARMACY",
  "DISPENSARY_STAFF",
  "APPOINTMENT_MANAGER",
  "PATIENT",
  "NURSE",
  "BILLING",
  "admin",
  "doctor",
  "receptionist",
  "lab",
  "lab_assistant",
  "pharmacy",
  "dispensary_staff",
  "appointment_manager",
  "patient",
  "nurse",
  "billing"
];

export const registerSchema = joi.object({
  name: joi.string().required().min(2).max(50),
  email: joi.string().email().required(),
  password: joi.string().required().min(6).max(100),
  phone: joi.string().optional().allow("", null),
  role: joi.string().valid(...validRoles).default("PATIENT"),
});

export const loginSchema = joi.object({
  email: joi.string().required(),
  password: joi.string().required(),
});

export const createUserSchema = joi.object({
  name: joi.string().required().min(2).max(50),
  email: joi.string().email().required(),
  password: joi.string().required().min(6).max(100),
  phone: joi.string().optional().allow("", null),
  role: joi.string().valid(...validRoles).required(),
});

export const updateUserSchema = joi.object({
  name: joi.string().optional().min(2).max(50),
  email: joi.string().email().optional(),
  phone: joi.string().optional().allow("", null),
  role: joi.string().valid(...validRoles).optional(),
  isActive: joi.boolean().optional(),
});

export const changePasswordSchema = joi.object({
  oldPassword: joi.string().required().min(6),
  newPassword: joi.string().required().min(6).max(100),
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

export const validateCreateUser = (req, res, next) => {
  const { error, value } = createUserSchema.validate(req.body, {
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

export const validateUpdateUser = (req, res, next) => {
  const { error, value } = updateUserSchema.validate(req.body, {
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

export const validateChangePassword = (req, res, next) => {
  const { error, value } = changePasswordSchema.validate(req.body, {
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
