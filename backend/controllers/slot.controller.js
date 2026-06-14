import Doctor from "../models/Doctor.js";
import Appointment from "../models/Appointment.js";
import { generateResponse, generateError } from "../utils/response.js";

// Helper to parse "HH:MM" to minutes
const parseTimeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
};

// Helper to format minutes to "HH:MM"
const formatMinutesToTime = (totalMinutes) => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

export const getAvailableSlots = async (req, res) => {
  try {
    const { doctorId, date } = req.query;
    if (!doctorId || !date) {
      return res.status(400).json(generateError("Doctor ID and date are required"));
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json(generateError("Doctor not found"));
    }

    // Determine day of the week
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const parsedDate = new Date(date);
    const dayName = daysOfWeek[parsedDate.getDay()];

    // Find schedule for this day
    const daySchedule = doctor.schedule?.find((s) => s.day === dayName && s.isAvailable);

    let startTime = "09:00";
    let endTime = "17:00";

    if (daySchedule) {
      startTime = daySchedule.startTime;
      endTime = daySchedule.endTime;
    }

    // Generate 30-minute slots
    const slots = [];
    let currentMinutes = parseTimeToMinutes(startTime);
    const endMinutes = parseTimeToMinutes(endTime);

    // Get all non-cancelled appointments for this doctor on this date
    const appointments = await Appointment.find({
      doctorId,
      date,
      status: { $nin: ["cancelled", "CANCELLED"] },
    });

    const bookedTimes = appointments.map((a) => a.slot);

    while (currentMinutes < endMinutes) {
      const timeStr = formatMinutesToTime(currentMinutes);
      slots.push({
        _id: timeStr,
        startTime: timeStr,
        status: bookedTimes.includes(timeStr) ? "booked" : "available",
      });
      currentMinutes += 30; // 30 minutes interval
    }

    res.json(generateResponse(slots, "Available slots fetched successfully"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};

export const generateSlots = async (req, res) => {
  try {
    res.status(201).json(generateResponse({}, "Slots generated successfully"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};

export const getAvailability = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json(generateError("Doctor not found"));
    }
    res.json(generateResponse(doctor.schedule || [], "Availability fetched successfully"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};
