import express from "express";

import {
  getEmergencyHospitals,
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

export default router;