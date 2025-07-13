import express from "express";
import auth from "../middleware/auth.js";
import { getRecentActions } from "../controllers/actionController.js";

const router = express.Router();

// Get last 20 actions
router.get("/", auth, getRecentActions);

export default router;
