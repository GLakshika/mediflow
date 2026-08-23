import express from "express";

import {
  getMyNotifications,
  markNotificationAsRead,
} from "../controllers/notificationController";

import {
  authenticate,
} from "../middleware/authMiddleware";

const router = express.Router();

router.get(
  "/my",
  authenticate,
  getMyNotifications
);

router.patch(
  "/:id/read",
  authenticate,
  markNotificationAsRead
);

export default router;