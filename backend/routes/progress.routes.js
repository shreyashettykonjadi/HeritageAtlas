import express from "express";
import {
  createOrUpdateProgress,
  getUserProgress,
  getSingleProgress,
} from "../controllers/progress.controller.js";

const router = express.Router();

// More specific route first
router.get("/:userId/:placeId", getSingleProgress);

// Less specific route after
router.get("/:userId", getUserProgress);

// POST upsert route
router.post("/", createOrUpdateProgress);

export default router;
