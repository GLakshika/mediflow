import express from "express";

import {
  getEmergencyHospitals,
  getAdminEmergencyCapacity,
  updateEmergencyCapacity,
} from "../controllers/emergencyController";

import {
  authenticate,
} from "../middleware/authMiddleware";

const router = express.Router();

router.get(
  "/",
  authenticate,
  getEmergencyHospitals
);

// Hospital Admin
router.get(
  "/admin",
  authenticate,
  getAdminEmergencyCapacity
);

router.patch(
  "/admin",
  authenticate,
  updateEmergencyCapacity
);

export default router;