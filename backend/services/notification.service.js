import Notification from "../models/Notification.js";

class NotificationService {
  async getUserNotifications(userId, isRead = false) {
    const query = { userId };
    if (typeof isRead === "boolean") query.isRead = isRead;

    return await Notification.find(query).sort({ createdAt: -1 });
  }

  async createNotification(userId, type, title, message, data = {}) {
    const notification = new Notification({
      userId,
      type,
      title,
      message,
      data,
    });

    await notification.save();
    return notification;
  }

  async markAsRead(notificationId) {
    return await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true, readAt: new Date() },
      { new: true }
    );
  }

  async markAllAsRead(userId) {
    return await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );
  }

  async deleteNotification(id) {
    return await Notification.findByIdAndDelete(id);
  }

  async getUnreadCount(userId) {
    return await Notification.countDocuments({ userId, isRead: false });
  }

  async sendAppointmentNotification(userId, appointmentData) {
    return this.createNotification(
      userId,
      "appointment",
      "Appointment Scheduled",
      `Your appointment is scheduled for ${appointmentData.date} at ${appointmentData.time}`,
      appointmentData
    );
  }

  async sendPaymentNotification(userId, paymentData) {
    return this.createNotification(
      userId,
      "payment",
      "Payment Received",
      `Payment of ${paymentData.amount} has been received`,
      paymentData
    );
  }
}

export default new NotificationService();
