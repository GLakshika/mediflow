import express from "express";

import {
  getAdminDashboard,
  getAdminAppointments,
} from "../controllers/hospitalAdminController";

import {
  authenticate,
} from "../middleware/authMiddleware";

const router = express.Router();

router.get(
  "/dashboard",
  authenticate,
  getAdminDashboard
);

router.get(
  "/appointments",
  authenticate,
  getAdminAppointments
);

export default router;