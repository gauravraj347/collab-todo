import express from "express";
import auth from "../middleware/auth.js";
import {
  getAllTasks,
  createTask,
  updateTask,
  deleteTask,
  smartAssign
} from "../controllers/taskController.js";

const router = express.Router();

// Get all tasks
router.get("/", auth, getAllTasks);

// Create task
router.post("/", auth, createTask);

// Update task (with conflict detection)
router.put("/:id", auth, updateTask);

// Delete task
router.delete("/:id", auth, deleteTask);

// Smart assign
router.post("/:id/smart-assign", auth, smartAssign);

export default router;
