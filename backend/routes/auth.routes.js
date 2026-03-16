import express from "express";
import {
  registerUser,
  loginUser,
  getCurrentUser,
  logoutUser,
} from "../controllers/auth.controller.js";
import { requireAuthWithUser } from "../middleware/requireAuth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = express.Router();

router.post("/register", asyncHandler(registerUser));
router.post("/login", asyncHandler(loginUser));
router.get("/me", requireAuthWithUser, asyncHandler(getCurrentUser));
router.post("/logout", asyncHandler(logoutUser));

export default router;
