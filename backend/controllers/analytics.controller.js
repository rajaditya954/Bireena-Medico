import { generateResponse, generateError } from "../utils/response.js";
import appointmentService from "../services/appointment.service.js";
import paymentService from "../services/payment.service.js";

export const getDashboardMetrics = async (req, res) => {
  try {
    const User = (await import("../models/User.js")).default;
    const Patient = (await import("../models/Patient.js")).default;
    const Doctor = (await import("../models/Doctor.js")).default;
    const Appointment = (await import("../models/Appointment.js")).default;
    const LabReport = (await import("../models/LabReport.js")).default;
    const Prescription = (await import("../models/Prescription.js")).default;
    const Payment = (await import("../models/Payment.js")).default;
    const Billing = (await import("../models/Billing.js")).default;
    const Service = (await import("../models/Service.js")).default;

    // ── Core counts ──
    const [totalPatients, totalDoctors, totalUsers, totalAppointments] = await Promise.all([
      Patient.countDocuments(),
      Doctor.countDocuments(),
      User.countDocuments(),
      Appointment.countDocuments(),
    ]);

    // ── Appointment status breakdown ──
    const allAppointments = await Appointment.find({});
    const completedAppointments = allAppointments.filter(a =>
      ["completed", "COMPLETED"].includes(a.status)
    ).length;
    const scheduledAppointments = allAppointments.filter(a =>
      ["scheduled", "SCHEDULED", "WAITING", "waiting", "ARRIVED", "arrived"].includes(a.status)
    ).length;
    const cancelledAppointments = allAppointments.filter(a =>
      ["cancelled", "CANCELLED"].includes(a.status)
    ).length;
    const noShowAppointments = allAppointments.filter(a =>
      ["no-show", "NO_SHOW"].includes(a.status)
    ).length;

    // ── Prescriptions count ──
    const totalPrescriptions = await Prescription.countDocuments();

    // ── Lab reports by status ──
    const allLabReports = await LabReport.find({});
    const labCompleted = allLabReports.filter(r =>
      ["COMPLETED", "APPROVED", "completed", "approved"].includes(r.status)
    ).length;
    const labPending = allLabReports.filter(r =>
      ["PENDING", "pending"].includes(r.status)
    ).length;
    const labInProgress = allLabReports.filter(r =>
      ["IN_PROGRESS", "in_progress"].includes(r.status)
    ).length;
    const totalLabReports = allLabReports.length;

    // ── Revenue from payments ──
    const allPayments = await Payment.find({ status: { $in: ["success", "SUCCESS"] } });
    const totalRevenue = allPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

    // ── Revenue breakdown from billings ──
    const allBillings = await Billing.find({});
    let consultationRevenue = 0;
    let labRevenue = 0;
    let pharmacyRevenue = 0;
    allBillings.forEach(bill => {
      (bill.items || []).forEach(item => {
        const cat = (item.serviceName || item.description || "").toLowerCase();
        if (cat.includes("consult") || cat.includes("doctor")) {
          consultationRevenue += item.amount || 0;
        } else if (cat.includes("lab") || cat.includes("test")) {
          labRevenue += item.amount || 0;
        } else if (cat.includes("pharm") || cat.includes("medicine")) {
          pharmacyRevenue += item.amount || 0;
        } else {
          consultationRevenue += item.amount || 0;
        }
      });
    });

    // ── Top doctors by appointments ──
    const doctors = await Doctor.find({}).populate("userId");
    const doctorsWithCounts = await Promise.all(
      doctors.map(async (doc) => {
        const aptCount = await Appointment.countDocuments({ doctorId: doc._id });
        return {
          name: doc.name,
          specialty: doc.specialization,
          appointments: aptCount,
        };
      })
    );
    doctorsWithCounts.sort((a, b) => b.appointments - a.appointments);
    const topDoctors = doctorsWithCounts.slice(0, 10);

    // ── Patient demographics (gender) ──
    const allPatients = await Patient.find({});
    let maleCount = 0, femaleCount = 0, otherCount = 0;
    allPatients.forEach(p => {
      const g = (p.gender || "").toLowerCase();
      if (g === "male" || g === "m") maleCount++;
      else if (g === "female" || g === "f") femaleCount++;
      else otherCount++;
    });

    // ── Staff by role ──
    const allUsers = await User.find({});
    const staffByRole = {};
    allUsers.forEach(u => {
      const role = (u.role || "other").toLowerCase();
      staffByRole[role] = (staffByRole[role] || 0) + 1;
    });

    // ── Recent activity (last 10 appointments) ──
    const recentAppointments = await Appointment.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("patientId")
      .populate("doctorId");

    const recentActivity = recentAppointments.map(apt => ({
      activity: `Appointment ${apt.status || "Scheduled"}`,
      details: `${apt.patientId?.fullName || "Patient"} - ${apt.reason || "General Checkup"}`,
      by: apt.doctorId?.name || "Doctor",
      dateTime: apt.createdAt
        ? new Date(apt.createdAt).toLocaleDateString("en-IN", {
            day: "2-digit", month: "short", year: "numeric",
          }) + ", " + new Date(apt.createdAt).toLocaleTimeString("en-US", {
            hour: "2-digit", minute: "2-digit",
          })
        : "N/A",
    }));

    // ── Weekly appointment trend (last 8 days) ──
    const appointmentsTrend = [];
    for (let i = 7; i >= 0; i--) {
      const day = new Date();
      day.setDate(day.getDate() - i);
      const start = new Date(day); start.setHours(0, 0, 0, 0);
      const end = new Date(day); end.setHours(23, 59, 59, 999);

      const dayAppts = allAppointments.filter(a => {
        const d = new Date(a.appointmentDate || a.createdAt);
        return d >= start && d <= end;
      });

      appointmentsTrend.push({
        date: day.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
        appointments: dayAppts.length,
        completed: dayAppts.filter(a => ["completed", "COMPLETED"].includes(a.status)).length,
      });
    }

    res.json(generateResponse({
      // Core stats
      totalPatients,
      totalDoctors,
      totalUsers,
      totalAppointments,
      totalPrescriptions,
      totalLabReports,
      totalRevenue,

      // Appointment status
      appointmentStatus: {
        completed: completedAppointments,
        scheduled: scheduledAppointments,
        cancelled: cancelledAppointments,
        noShow: noShowAppointments,
      },

      // Lab report status
      labReportsStatus: {
        completed: labCompleted,
        pending: labPending,
        inProgress: labInProgress,
        total: totalLabReports,
      },

      // Revenue breakdown
      revenueBreakdown: {
        consultation: consultationRevenue,
        lab: labRevenue,
        pharmacy: pharmacyRevenue,
      },

      // Gender demographics
      genderDistribution: {
        male: maleCount,
        female: femaleCount,
        other: otherCount,
      },

      // Staff by role
      staffByRole,

      // Top doctors
      topDoctors,

      // Weekly trend
      appointmentsTrend,

      // Recent activity
      recentActivity,

    }, "Admin dashboard metrics fetched successfully"));
  } catch (error) {
    console.error("Dashboard metrics error:", error);
    res.status(500).json(generateError(error.message));
  }
};

export const getRevenueAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const stats = await paymentService.getPaymentStatistics(new Date(startDate), new Date(endDate));
    
    let totalRevenue = 0;
    stats.forEach(stat => {
      totalRevenue += stat.totalAmount;
    });

    res.json(generateResponse({
      totalRevenue,
      byPaymentMethod: stats,
    }, "Revenue analytics fetched"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};

export const getPatientAnalytics = async (req, res) => {
  try {
    const Patient = (await import("../models/Patient.js")).default;
    const totalPatients = await Patient.countDocuments();

    res.json(generateResponse({
      totalPatients,
      newPatients: 0,
      activePatients: totalPatients,
    }, "Patient analytics fetched"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};

export const getDoctorAnalytics = async (req, res) => {
  try {
    const Doctor = (await import("../models/Doctor.js")).default;
    const totalDoctors = await Doctor.countDocuments();
    const verifiedDoctors = await Doctor.countDocuments({ isVerified: true });

    res.json(generateResponse({
      totalDoctors,
      verifiedDoctors,
      totalConsultations: 0,
    }, "Doctor analytics fetched"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};
