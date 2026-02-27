import express from "express";
import { getMapSites } from "../controllers/site.controller.js";

const router = express.Router();

router.get("/map", getMapSites);

export default router;
