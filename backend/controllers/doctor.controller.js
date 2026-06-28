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

        if (!doctor && (req.user?.role === "DOCTOR" || req.user?.role === "doctor")) {
          try {
            const userRecord = await User.findById(req.user.id);
            if (userRecord) {
              const doctorCode = `DOC${String(Math.floor(100 + Math.random() * 900))}`;
              doctor = await Doctor.create({
                userId: userRecord._id,
                doctorCode,
                name: userRecord.name,
                specialization: "General Medicine",
                consultantType: "doctor",
                qualification: "MBBS",
                description: "Default doctor profile.",
                registrationNumber: `REG-${Date.now()}`,
                experience: 0,
                consultationFee: "0",
                roomNumber: "TBD",
                schedule: [],
                isVerified: true
              });
              console.log(`Created default doctor profile for ${userRecord.name} (user ID: ${userRecord._id}) on the fly.`);
            }
          } catch (err) {
            console.error("Failed to auto-create doctor profile on-the-fly:", err);
          }
        }
      }

      if (!doctor) {
        return res.status(404).json(generateError(
          `No doctor profile found for your account. Please contact an administrator to link your account.`
        ));
      }

      appointments = await appointmentService.getAllAppointments({
        doctorId: doctor._id,
        appointmentDate: { $gte: startOfDay, $lte: endOfDay }
      });
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
        const fee = Number(a.doctorId?.consultationFee || doctor.consultationFee || 500);
        todayRevenue += isNaN(fee) ? 500 : fee;
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
      userId: d.userId,
      doctorCode: d.doctorCode,
      name: d.name,
      specialization: d.specialization,
      consultantType: d.consultantType || "doctor",
      qualification: d.qualification,
      description: d.description,
      qualifications: d.qualifications || [],
      registrationNumber: d.registrationNumber,
      experience: d.experience,
      consultationFee: d.consultationFee,
      roomNumber: d.roomNumber,
      schedule: d.schedule || [],
      isVerified: d.isVerified,
      rating: d.rating,
      totalConsultations: d.totalConsultations
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

    let { userId, email, username, password, name, fullName, phone, doctorCode, experience, consultationFee, qualification, qualifications, schedule, timeSlots } = req.body;
    
    const doctorName = name || fullName;
    if (!doctorName) {
      return res.status(400).json(generateError("Doctor name is required"));
    }

    if (!userId) {
      // Support both username-based and email-based creation
      const loginIdentifier = username || email;
      if (!loginIdentifier || !password) {
        return res.status(400).json(generateError("Username and Password are required to create a new doctor account"));
      }

      // Auto-generate email from username if only username is provided
      const userEmail = email || `${username.toLowerCase().replace(/[^a-z0-9._-]/g, '')}@bireena.local`;
      const userUsername = username || email.split('@')[0];

      const existingUser = await User.findOne({ 
        $or: [
          { email: userEmail.toLowerCase() },
          { username: userUsername.toLowerCase() }
        ]
      });
      if (existingUser) {
        return res.status(400).json(generateError("Username is already taken"));
      }

      // Create the User record
      const newUser = new User({
        name: doctorName,
        username: userUsername.toLowerCase(),
        email: userEmail.toLowerCase(),
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

// ==================== DOCTOR-SPECIFIC PORTAL ENDPOINTS ====================

/**
 * Helper: resolves the Doctor record for the logged-in user.
 * Returns null if not found (caller should 404).
 */
async function _resolveDoctorForUser(req) {
  const Doctor = (await import("../models/Doctor.js")).default;
  const isAdmin = req.user?.role === "admin" || req.user?.role === "ADMIN";
  if (isAdmin && req.query.doctorId && req.query.doctorId !== "all") {
    return doctorService.getDoctorById(req.query.doctorId);
  }
  return doctorService.getDoctorByUserId(req.user?.id);
}

/**
 * GET /api/doctors/my-patients
 * Returns patients who have had appointments with this doctor.
 */
export const getMyPatients = async (req, res) => {
  try {
    const doctor = await _resolveDoctorForUser(req);
    if (!doctor) {
      return res.status(404).json(generateError("No doctor profile found for your account."));
    }

    const Appointment = (await import("../models/Appointment.js")).default;
    const Patient = (await import("../models/Patient.js")).default;

    // Find all unique patient IDs from this doctor's appointments
    const appointments = await Appointment.find({ doctorId: doctor._id })
      .select("patientId")
      .lean();

    const patientIdSet = [...new Set(appointments.map(a => a.patientId?.toString()).filter(Boolean))];

    const patients = await Patient.find({ _id: { $in: patientIdSet } }).sort({ createdAt: -1 });

    const mapped = patients.map(p => ({
      id: p._id,
      _id: p._id,
      name: p.fullName,
      fullName: p.fullName,
      patientId: p.patientId || p._id,
      age: p.age,
      gender: p.gender,
      phone: p.phone,
      email: p.email,
      dob: p.dob,
      bloodGroup: p.bloodGroup,
      maritalStatus: p.maritalStatus,
      address: p.address,
      city: p.city,
      state: p.state,
      pincode: p.pincode,
      referredBy: p.referredBy,
      allergies: p.allergies || [],
      chronicDiseases: p.chronicDiseases || [],
      medicalHistory: p.medicalHistory || [],
      emergencyContact: p.emergencyContact || { name: "", relation: "", phone: "" },
      insuranceInfo: p.insuranceInfo || { provider: "", policyNumber: "" },
    }));

    res.json(generateResponse(mapped, "Doctor-specific patients fetched successfully"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};

/**
 * GET /api/doctors/my-history
 * Returns this doctor's appointment history (all dates, sorted newest first).
 */
export const getMyHistory = async (req, res) => {
  try {
    const doctor = await _resolveDoctorForUser(req);
    if (!doctor) {
      return res.status(404).json(generateError("No doctor profile found for your account."));
    }

    const appointments = await appointmentService.getAllAppointments({
      doctorId: doctor._id,
    });

    // Sort newest first
    appointments.sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate));

    const history = appointments.map(apt => ({
      id: apt._id,
      date: apt.appointmentDate,
      slot: apt.slot,
      status: apt.status,
      reason: apt.reason || "Consultation",
      notes: apt.notes || "",
      patient: apt.patientId ? {
        id: apt.patientId._id,
        name: apt.patientId.fullName,
        age: apt.patientId.age,
        gender: apt.patientId.gender,
        phone: apt.patientId.phone,
        email: apt.patientId.email,
      } : { name: apt.patientName || "Unknown" },
      doctor: {
        id: doctor._id,
        name: doctor.name,
        specialization: doctor.specialization,
      },
    }));

    res.json(generateResponse({
      doctor: {
        id: doctor._id,
        name: doctor.name,
        specialization: doctor.specialization,
        qualification: doctor.qualification,
        experience: doctor.experience,
      },
      history
    }, "Doctor history fetched successfully"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};

/**
 * GET /api/doctors/my-prescriptions
 * Returns prescriptions created by this doctor.
 */
export const getMyPrescriptions = async (req, res) => {
  try {
    const doctor = await _resolveDoctorForUser(req);
    if (!doctor) {
      return res.status(404).json(generateError("No doctor profile found for your account."));
    }

    const Prescription = (await import("../models/Prescription.js")).default;

    const prescriptions = await Prescription.find({ doctorId: doctor._id })
      .populate("patientId")
      .populate("appointmentId")
      .sort({ createdAt: -1 });

    const mapped = prescriptions.map(p => ({
      id: p._id,
      prescriptionId: p.prescriptionId,
      diagnosis: p.diagnosis,
      symptoms: p.symptoms || [],
      medicines: p.medicines || [],
      advice: p.advice,
      followUpDate: p.followUpDate,
      notes: p.notes,
      isActive: p.isActive,
      createdAt: p.createdAt,
      patient: p.patientId ? {
        id: p.patientId._id,
        name: p.patientId.fullName,
        age: p.patientId.age,
        gender: p.patientId.gender,
        phone: p.patientId.phone,
      } : null,
      appointment: p.appointmentId ? {
        id: p.appointmentId._id,
        date: p.appointmentId.appointmentDate,
        slot: p.appointmentId.slot,
        reason: p.appointmentId.reason,
      } : null,
    }));

    res.json(generateResponse({
      doctor: {
        id: doctor._id,
        name: doctor.name,
        specialization: doctor.specialization,
      },
      prescriptions: mapped
    }, "Doctor prescriptions fetched successfully"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};

/**
 * GET /api/doctors/my-reports
 * Returns lab reports ordered by this doctor.
 */
export const getMyReports = async (req, res) => {
  try {
    const doctor = await _resolveDoctorForUser(req);
    if (!doctor) {
      return res.status(404).json(generateError("No doctor profile found for your account."));
    }

    const LabReport = (await import("../models/LabReport.js")).default;

    const reports = await LabReport.find({ doctorId: doctor._id })
      .populate("patientId")
      .populate("tests")
      .sort({ createdAt: -1 });

    const mapped = reports.map(r => ({
      id: r._id,
      reportId: r.reportId,
      status: r.status,
      sampleDate: r.sampleDate,
      reportDate: r.reportDate,
      findings: r.findings,
      remarks: r.remarks,
      reportFile: r.reportFile,
      createdAt: r.createdAt,
      tests: (r.tests || []).map(t => ({
        id: t._id,
        testName: t.testName || t.name,
        category: t.category,
      })),
      patient: r.patientId ? {
        id: r.patientId._id,
        name: r.patientId.fullName,
        age: r.patientId.age,
        gender: r.patientId.gender,
        phone: r.patientId.phone,
      } : null,
    }));

    res.json(generateResponse({
      doctor: {
        id: doctor._id,
        name: doctor.name,
        specialization: doctor.specialization,
      },
      reports: mapped
    }, "Doctor reports fetched successfully"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};

/**
 * GET /api/doctors/my-appointments
 * Returns all appointments for this doctor (optionally filtered by date or history mode).
 */
export const getMyAppointments = async (req, res) => {
  try {
    const doctor = await _resolveDoctorForUser(req);
    if (!doctor) {
      return res.status(404).json(generateError("No doctor profile found for your account."));
    }

    const { date, history } = req.query;

    let query = { doctorId: doctor._id };

    // If history=true, return all appointments (no date filter)
    // Otherwise, filter by the given date (or today)
    if (history !== "true" && date !== "all") {
      const dateStr = date || new Date().toISOString().split("T")[0];
      const [year, month, day] = dateStr.split("-").map(Number);
      const startOfDay = new Date(year, month - 1, day);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(year, month - 1, day);
      endOfDay.setHours(23, 59, 59, 999);
      query.appointmentDate = { $gte: startOfDay, $lte: endOfDay };
    }

    const appointments = await appointmentService.getAllAppointments(query);

    res.json(generateResponse(appointments, "Doctor-specific appointments fetched successfully"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};
