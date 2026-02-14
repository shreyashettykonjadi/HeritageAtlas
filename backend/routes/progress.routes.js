import express from "express";
import {
  createOrUpdateProgress,
  getUserProgress,
  getSingleProgress,
} from "../controllers/progress.controller.js";
import { requireAnonymousId } from "../middleware/anonymous.middleware.js";

const router = express.Router();

router.use(requireAnonymousId);

// Get all progress for current user
router.get("/", getUserProgress);

// Get single place progress for current user
router.get("/:placeId", getSingleProgress);

// Create or update progress
router.post("/", createOrUpdateProgress);

export default router;
