import express from "express";
import auth from "../middleware/auth.js";
import { getAllUsers, getCurrentUser } from "../controllers/userController.js";

const router = express.Router();

// Get all users (for assignment)
router.get("/", auth, getAllUsers);

// Get current user info
router.get("/me", auth, getCurrentUser);

export default router;
