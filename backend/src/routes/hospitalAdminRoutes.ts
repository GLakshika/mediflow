import express from "express";

import {
  getAdminDashboard,
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

export default router;