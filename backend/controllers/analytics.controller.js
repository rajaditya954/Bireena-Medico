import { generateResponse, generateError } from "../utils/response.js";
import appointmentService from "../services/appointment.service.js";
import billingService from "../services/billing.service.js";
import paymentService from "../services/payment.service.js";

export const getDashboardMetrics = async (req, res) => {
  try {
    const appointments = await appointmentService.getAllAppointments();
    const totalAppointments = appointments.length;
    const completedAppointments = appointments.filter(a => a.status === "completed").length;
    const cancelledAppointments = appointments.filter(a => a.status === "cancelled").length;

    res.json(generateResponse({
      totalAppointments,
      completedAppointments,
      cancelledAppointments,
    }, "Dashboard metrics fetched"));
  } catch (error) {
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
    // This would integrate with patient data
    res.json(generateResponse({
      totalPatients: 0,
      newPatients: 0,
      activePatients: 0,
    }, "Patient analytics fetched"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};

export const getDoctorAnalytics = async (req, res) => {
  try {
    // This would integrate with doctor data
    res.json(generateResponse({
      totalDoctors: 0,
      verifiedDoctors: 0,
      totalConsultations: 0,
    }, "Doctor analytics fetched"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};
