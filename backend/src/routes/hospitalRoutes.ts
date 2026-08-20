import { Router } from "express";

import {
  getHospitals,
  getHospitalById,
} from "../controllers/hospitalController";

import {
  authenticate,
} from "../middleware/authMiddleware";

const router = Router();

router.get(
  "/",
  authenticate,
  getHospitals
);

router.get(
  "/:id",
  authenticate,
  getHospitalById
);

export default router;