import joi from "joi";

export const doctorSchema = joi.object({
  userId: joi.string().required(),
  licenseNumber: joi.string().required(),
  specialization: joi.string().required(),
  qualifications: joi.array().items(joi.string()),
  experience: joi.number().min(0),
  consultationFee: joi.number().min(0),
  availableSlots: joi.array().items(
    joi.object({
      day: joi.string(),
      startTime: joi.string(),
      endTime: joi.string(),
    })
  ),
});

export const validateDoctorInput = (req, res, next) => {
  const { error, value } = doctorSchema.validate(req.body, {
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
