import express from "express";

import {
  getMyQueue,
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

export default router;