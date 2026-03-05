import express from "express";
import { getMapSites, getSiteBySlug } from "../controllers/site.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = express.Router();

router.get("/map", getMapSites);
router.get("/:slug", asyncHandler(getSiteBySlug));

export default router;
