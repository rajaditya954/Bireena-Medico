import joi from "joi";

export const appointmentSchema = joi.object({
  patientId: joi.string().required(),
  doctorId: joi.string().required(),
  appointmentDate: joi.date().required(),
  slot: joi.string().required(),
  status: joi.string().valid("scheduled", "completed", "cancelled", "no-show"),
  reason: joi.string(),
  notes: joi.string(),
});

export const validateAppointmentInput = (req, res, next) => {
  const { error, value } = appointmentSchema.validate(req.body, {
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
