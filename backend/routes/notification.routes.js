import express from "express";
import * as notificationController from "../controllers/notification.controller.js";

const router = express.Router();

router.get("/", notificationController.getUserNotifications);
router.put("/:id/read", notificationController.markAsRead);
router.put("/read-all", notificationController.markAllAsRead);
router.delete("/:id", notificationController.deleteNotification);
router.get("/unread/count", notificationController.getUnreadCount);

export default router;
