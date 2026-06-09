import { logger } from "../utils/logger.js";
import Appointment from "../models/Appointment.js";
import Payment from "../models/Payment.js";

export const dailyAnalyticsJob = async () => {
  try {
    logger.info("Running daily analytics job...");
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const appointmentStats = await Appointment.aggregate([
      {
        $match: {
          createdAt: { $gte: today, $lt: tomorrow },
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const paymentStats = await Payment.aggregate([
      {
        $match: {
          createdAt: { $gte: today, $lt: tomorrow },
          status: "success",
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    logger.info("Daily analytics computed", {
      appointments: appointmentStats,
      payments: paymentStats,
    });
  } catch (error) {
    logger.error("Daily analytics job failed:", error);
  }
};

// Schedule job to run daily at 11:59 PM
export const scheduleDailyAnalytics = () => {
  const now = new Date();
  const target = new Date();
  target.setHours(23, 59, 0, 0);
  
  if (target < now) {
    target.setDate(target.getDate() + 1);
  }
  
  const timeout = target.getTime() - now.getTime();
  setTimeout(() => {
    dailyAnalyticsJob();
    setInterval(dailyAnalyticsJob, 24 * 60 * 60 * 1000); // Run daily
  }, timeout);
  
  logger.info("Daily analytics job scheduled to run daily");
};
