import { logger } from "../utils/logger.js";
import appointmentService from "../services/appointment.service.js";

export const appointmentReminderJob = async () => {
  try {
    logger.info("Running appointment reminder job...");
    
    const appointments = await appointmentService.getAllAppointments({
      status: "scheduled",
    });

    const now = new Date();
    const reminderTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

    for (const appointment of appointments) {
      const appointmentTime = new Date(appointment.appointmentDate);
      
      if (appointmentTime <= reminderTime && appointmentTime > now && !appointment.isReminder) {
        await appointmentService.sendReminderNotification(appointment._id);
        logger.info(`Reminder sent for appointment: ${appointment._id}`);
      }
    }
  } catch (error) {
    logger.error("Appointment reminder job failed:", error);
  }
};

// Schedule job to run every hour
export const scheduleAppointmentReminders = () => {
  setInterval(appointmentReminderJob, 60 * 60 * 1000);
  logger.info("Appointment reminder job scheduled to run hourly");
};
