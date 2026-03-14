import express from "express";
import {
  createOrUpdateProgress,
  getUserProgress,
  getSingleProgress,
  deleteProgress,
} from "../controllers/progress.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = express.Router();

router.use(requireAuth);

// Get all progress for current user
router.get("/", asyncHandler(getUserProgress));

// Get single place progress for current user
router.get("/:slug", asyncHandler(getSingleProgress));

// Create or update progress
router.post("/", asyncHandler(createOrUpdateProgress));

// Delete progress
router.delete("/:slug", asyncHandler(deleteProgress));

export default router;
