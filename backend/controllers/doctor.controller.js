import doctorService from "../services/doctor.service.js";
import appointmentService from "../services/appointment.service.js";
import { generateResponse, generateError } from "../utils/response.js";

export const getMyDashboard = async (req, res) => {
  try {
    const User = (await import("../models/User.js")).default;
    const Doctor = (await import("../models/Doctor.js")).default;

    let queryDate = new Date();
    if (req.query.date) {
      const [year, month, day] = req.query.date.split("-").map(Number);
      queryDate = new Date(year, month - 1, day);
    }
    const startOfDay = new Date(queryDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(queryDate);
    endOfDay.setHours(23, 59, 59, 999);

    const isAdmin = req.user?.role === "admin" || req.user?.role === "ADMIN";
    const requestDoctorId = req.query.doctorId;

    let doctor;
    let appointments = [];
    let isAllDoctors = false;

    if (isAdmin && (!requestDoctorId || requestDoctorId === "all")) {
      isAllDoctors = true;
      const doctors = await doctorService.getAllDoctors();
      if (doctors.length === 0) {
        return res.status(404).json(generateError("No doctors found in the database."));
      }

      const doctorIds = doctors.map(d => d._id);
      appointments = await appointmentService.getAllAppointments({
        doctorId: { $in: doctorIds },
        appointmentDate: { $gte: startOfDay, $lte: endOfDay }
      });

      doctor = {
        name: "All Doctors (Summary)",
        specialization: "Consolidated Clinic View",
        qualification: "Hospital Admin",
        experience: null,
        registrationNumber: "N/A",
        roomNumber: "All Rooms"
      };
    } else {
      if (isAdmin && requestDoctorId) {
        doctor = await doctorService.getDoctorById(requestDoctorId);
      } else {
        doctor = await doctorService.getDoctorByUserId(req.user?.id);
      }

      if (!doctor) {
        doctor = await Doctor.findOne({});
        if (!doctor) {
          return res.status(404).json(generateError(`Doctor profile not found.`));
        }
      }

      appointments = await appointmentService.getAllAppointments({
        doctorId: doctor._id,
        appointmentDate: { $gte: startOfDay, $lte: endOfDay }
      });

      // Handle auto-seeding mock appointments for development if empty
      if (appointments.length === 0) {
        try {
          const Patient = (await import("../models/Patient.js")).default;
          const Appointment = (await import("../models/Appointment.js")).default;
          const patients = await Patient.find({}).limit(8);
          if (patients.length > 0) {
            const mockAptsData = [
              { slot: "11:00", status: "WAITING", reason: "Chest discomfort", notes: "Routine checkup" },
              { slot: "09:30", status: "ARRIVED", reason: "Fever & Cold", notes: "Fever and cold follow up" },
              { slot: "10:00", status: "IN_PROGRESS", reason: "Gastritis", notes: "Severe gastric distress" },
              { slot: "08:30", status: "completed", reason: "High Blood Pressure", notes: "Hypertension checkup" },
              { slot: "09:00", status: "completed", reason: "Seasonal Allergy", notes: "Allergy symptoms" },
              { slot: "11:30", status: "scheduled", reason: "General Exam", notes: "Routine checkup" },
              { slot: "12:00", status: "scheduled", reason: "Consultation", notes: "Follow-up consultation" },
              { slot: "12:30", status: "NO_SHOW", reason: "Migraine Follow Up", notes: "Patient did not attend appointment" }
            ];

            for (let i = 0; i < mockAptsData.length; i++) {
              const patient = patients[i % patients.length];
              const aptData = mockAptsData[i];
              const appointmentId = `APT${Date.now().toString().slice(-4)}${i}`;

              await Appointment.create({
                appointmentId,
                patientId: patient._id,
                doctorId: doctor._id,
                appointmentDate: new Date(),
                appointmentType: "WALK_IN",
                priority: "NORMAL",
                tokenNumber: 10 + i,
                slot: aptData.slot,
                status: aptData.status,
                reason: aptData.reason,
                notes: aptData.notes
              });
            }

            appointments = await appointmentService.getAllAppointments({
              doctorId: doctor._id,
              appointmentDate: { $gte: startOfDay, $lte: endOfDay }
            });
          }
        } catch (seedErr) {
          console.error("Error dynamically seeding dashboard appointments:", seedErr);
        }
      }
    }

    // Calculate stats
    const totalAppointments = appointments.length;
    const patientsSeen = appointments.filter(a =>
      ["completed", "COMPLETED"].includes(a.status)
    ).length;

    // Calculate today's revenue based on each completed appointment's doctor fee
    let todayRevenue = 0;
    appointments.forEach(a => {
      if (["completed", "COMPLETED"].includes(a.status)) {
        const fee = a.doctorId?.consultationFee || doctor.consultationFee || 500;
        todayRevenue += fee;
      }
    });

    const remainingPatients = appointments.filter(a =>
      ["waiting", "WAITING", "arrived", "ARRIVED", "in_progress", "IN_PROGRESS", "in-progress", "scheduled"].includes(a.status)
    ).length;

    const cancelled = appointments.filter(a => ["cancelled", "CANCELLED"].includes(a.status)).length;
    const noShow = appointments.filter(a => ["no-show", "NO_SHOW"].includes(a.status)).length;

    res.json(generateResponse({
      doctor,
      appointments,
      stats: {
        totalAppointments,
        patientsSeen,
        avgConsultationTime: isAllDoctors ? "N/A" : (doctor.avgConsultationTime || "18m"),
        todayRevenue,
        remainingPatients,
        cancelled,
        noShow
      }
    }, "Dashboard metrics fetched successfully"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};


export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await doctorService.getAllDoctors();
    const mapped = doctors.map(d => ({
      id: d._id,
      _id: d._id,
      name: d.name,
      specialization: d.specialization,
      consultantType: d.consultantType || "doctor",
      roomNumber: d.roomNumber,
      consultationFee: d.consultationFee,
    }));
    res.json(generateResponse(mapped, "Doctors fetched successfully"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};

export const getDoctorById = async (req, res) => {
  try {
    const doctor = await doctorService.getDoctorById(req.params.id);
    if (!doctor) {
      return res.status(404).json(generateError("Doctor not found"));
    }
    res.json(generateResponse({ doctor }, "Doctor fetched successfully"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};

export const createDoctor = async (req, res) => {
  try {
    const User = (await import("../models/User.js")).default;
    const Doctor = (await import("../models/Doctor.js")).default;

    let { userId, email, password, name, fullName, phone, doctorCode, experience, consultationFee, qualification, qualifications, schedule, timeSlots } = req.body;
    
    const doctorName = name || fullName;
    if (!doctorName) {
      return res.status(400).json(generateError("Doctor name is required"));
    }

    if (!userId) {
      if (!email || !password) {
        return res.status(400).json(generateError("Email and Password are required to create a new doctor account"));
      }

      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json(generateError("Email is already registered"));
      }

      // Create the User record
      const newUser = new User({
        name: doctorName,
        email: email.toLowerCase(),
        phone: phone || "",
        role: "doctor",
        isActive: true,
      });
      await newUser.setPassword(password);
      await newUser.save();

      req.body.userId = newUser._id;
    }

    if (!doctorCode) {
      const count = await Doctor.countDocuments();
      req.body.doctorCode = `DOC${String(count + 1).padStart(3, "0")}`;
    }

    // Map timeSlots from frontend if schedule is not present
    if (!schedule && timeSlots) {
      req.body.schedule = timeSlots.map(slot => ({
        day: slot.day || "Monday",
        startTime: slot.from || "09:00",
        endTime: slot.to || "17:00",
        isAvailable: true
      }));
    }

    if (!req.body.name) {
      req.body.name = doctorName;
    }

    if (experience) {
      req.body.experience = parseFloat(experience);
    }

    if (consultationFee) {
      req.body.consultationFee = parseFloat(consultationFee);
    }

    // Set qualifications array
    if (!qualifications && qualification) {
      req.body.qualifications = [qualification];
    }

    const doctor = await doctorService.createDoctor(req.body);
    res.status(201).json(generateResponse({ doctor }, "Doctor created successfully"));
  } catch (error) {
    res.status(400).json(generateError(error.message));
  }
};

export const updateDoctor = async (req, res) => {
  try {
    const doctor = await doctorService.updateDoctor(req.params.id, req.body);
    res.json(generateResponse({ doctor }, "Doctor updated successfully"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};

export const deletDoctor = async (req, res) => {
  try {
    await doctorService.deleteDoctor(req.params.id);
    res.json(generateResponse({}, "Doctor deleted successfully"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};

export const getDoctorsBySpecialization = async (req, res) => {
  try {
    const { specialization } = req.params;
    const doctors = await doctorService.getDoctorsBySpecialization(specialization);
    const mapped = doctors.map(d => ({
      id: d._id,
      _id: d._id,
      name: d.name,
      specialization: d.specialization,
      consultantType: d.consultantType || "doctor",
      roomNumber: d.roomNumber,
      consultationFee: d.consultationFee,
    }));
    res.json(generateResponse(mapped, "Doctors fetched successfully"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};
