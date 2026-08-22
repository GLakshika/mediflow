import { Router } from "express";
import { getDoctorAppointments,
    updateDoctorAppointmentStatus,
} from "../controllers/doctorAppointmentController";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

router.get(
  "/doctor",
  authenticate,
  getDoctorAppointments
);

router.patch(
  "/doctor/:id/status",
  authenticate,
  updateDoctorAppointmentStatus
);
export default router;