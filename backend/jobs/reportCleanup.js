import { logger } from "../utils/logger.js";
import LabReport from "../models/LabReport.js";

export const reportCleanupJob = async () => {
  try {
    logger.info("Running report cleanup job...");
    
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const deletedReports = await LabReport.deleteMany({
      status: "completed",
      updatedAt: { $lt: thirtyDaysAgo },
    });

    logger.info(`Cleaned up ${deletedReports.deletedCount} old completed reports`);
  } catch (error) {
    logger.error("Report cleanup job failed:", error);
  }
};

// Schedule job to run daily at 2 AM
export const scheduleReportCleanup = () => {
  const now = new Date();
  const target = new Date();
  target.setHours(2, 0, 0, 0);
  
  if (target < now) {
    target.setDate(target.getDate() + 1);
  }
  
  const timeout = target.getTime() - now.getTime();
  setTimeout(() => {
    reportCleanupJob();
    setInterval(reportCleanupJob, 24 * 60 * 60 * 1000); // Run daily
  }, timeout);
  
  logger.info("Report cleanup job scheduled to run daily");
};
