import express from "express";

import {
  getAdminDepartments,
  addDepartment,
  updateDepartment,
  updateDepartmentStatus,
} from "../controllers/departmentController";

import {
  authenticate
} from "../middleware/authMiddleware";

const router = express.Router();

router.get(
  "/admin",
  authenticate,
  getAdminDepartments
);

router.post(
  "/admin",
  authenticate,
  addDepartment
);

router.patch(
  "/admin/:id",
  authenticate,
  updateDepartment
);

router.patch(
  "/admin/:id/status",
  authenticate,
  updateDepartmentStatus
);

export default router;