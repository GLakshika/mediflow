import express from "express";

import {
  getAdminDoctors,
  addDoctor,
  updateDoctor,
  updateDoctorStatus
} from "../controllers/doctorController";

import {
  authenticate,
} from "../middleware/authMiddleware";

const router = express.Router();

router.get(
  "/admin",
  authenticate,
  getAdminDoctors
);

router.post(
  "/admin",
  authenticate,
  addDoctor
);

router.put(
  "/admin/:id",
  authenticate,
  updateDoctor
);

router.patch(
  "/admin/:id/status",
  authenticate,
  updateDoctorStatus
);

export default router;