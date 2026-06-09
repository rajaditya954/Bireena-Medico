import joi from "joi";

export const patientSchema = joi.object({
  userId: joi.string().required(),
  age: joi.number().min(0).max(150),
  gender: joi.string().valid("Male", "Female", "Other"),
  bloodType: joi.string().valid("A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"),
  allergies: joi.array().items(joi.string()),
  medicalHistory: joi.array().items(joi.string()),
  address: joi.string(),
  city: joi.string(),
  state: joi.string(),
  zipCode: joi.string(),
});

export const validatePatientInput = (req, res, next) => {
  const { error, value } = patientSchema.validate(req.body, {
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
