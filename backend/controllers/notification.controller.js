import notificationService from "../services/notification.service.js";
import { generateResponse, generateError } from "../utils/response.js";

export const getUserNotifications = async (req, res) => {
  try {
    const { isRead } = req.query;
    const notifications = await notificationService.getUserNotifications(
      req.user.id,
      isRead ? isRead === "true" : undefined
    );
    res.json(generateResponse({ notifications }, "Notifications fetched successfully"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};

export const markAsRead = async (req, res) => {
  try {
    const notification = await notificationService.markAsRead(req.params.id);
    res.json(generateResponse({ notification }, "Notification marked as read"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    await notificationService.markAllAsRead(req.user.id);
    res.json(generateResponse({}, "All notifications marked as read"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};

export const deleteNotification = async (req, res) => {
  try {
    await notificationService.deleteNotification(req.params.id);
    res.json(generateResponse({}, "Notification deleted successfully"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const count = await notificationService.getUnreadCount(req.user.id);
    res.json(generateResponse({ count }, "Unread count fetched"));
  } catch (error) {
    res.status(500).json(generateError(error.message));
  }
};
