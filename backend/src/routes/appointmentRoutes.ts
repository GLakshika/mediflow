import express from "express";

import {
  createAppointment,
  getMyAppointments,
  cancelAppointment,
} from "../controllers/appointmentController";

import {
  authenticate,
} from "../middleware/authMiddleware";


const router = express.Router();


router.post(
  "/",
  authenticate,
  createAppointment
);

router.get(
  "/my",
  authenticate,
  getMyAppointments
);
router.patch(
  "/:id/cancel",
  authenticate,
  cancelAppointment
);

export default router;