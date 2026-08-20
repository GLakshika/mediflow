import express from "express";

import {
  getAdminDoctors,
  addDoctor,
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

export default router;