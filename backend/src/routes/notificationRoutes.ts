import express from "express";

import {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../controllers/notificationController";

import {
  authenticate,
} from "../middleware/authMiddleware";

const router = express.Router();

router.get(
  "/",
  authenticate,
  getMyNotifications
);

router.patch(
  "/:id/read",
  authenticate,
  markNotificationAsRead
);


// Mark all notifications as read
router.patch(
  "/read-all",
  authenticate,
  markAllNotificationsAsRead
);

export default router;