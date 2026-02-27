import express from "express";
import { getMapSites, getSiteBySlug } from "../controllers/site.controller.js";

const router = express.Router();

router.get("/map", getMapSites);
router.get("/:slug", getSiteBySlug);

export default router;
