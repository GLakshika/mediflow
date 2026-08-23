import express from "express";
import { Router } from "express";

import {
  getMyQueue,
  getDoctorQueue,
  callPatient,
  skipPatient,
  completeQueue
} from "../controllers/queueController";

import {
  authenticate,
} from "../middleware/authMiddleware";

const router = express.Router();

router.get(
  "/my",
  authenticate,
  getMyQueue
);

router.get(
  "/doctor",
  authenticate,
  getDoctorQueue
);

router.patch(
  "/doctor/:id/call",
  authenticate,
  callPatient
);

router.patch(
  "/doctor/:id/complete",
  authenticate,
  completeQueue
);

router.patch(
  "/doctor/:id/skip",
  authenticate,
  skipPatient
);
export default router;