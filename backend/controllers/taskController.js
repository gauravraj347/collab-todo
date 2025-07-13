import mongoose from "mongoose";
import Task from "../models/Task.js";
import User from "../models/User.js";
import ActionLog from "../models/ActionLog.js";

const COLUMN_NAMES = ["Todo", "In Progress", "Done"];

// Helper: log action
async function logAction(action, userId, taskId, details = "") {
  await ActionLog.create({ action, user: userId, task: taskId, details });
}

// Helper: unique title validation
async function isTitleValid(title, taskId = null) {
  if (COLUMN_NAMES.includes(title)) return false;
  const query = { title };
  if (taskId) query._id = { $ne: taskId };
  const exists = await Task.findOne(query);
  return !exists;
}

// Get all tasks
export const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find().populate("assignedTo", "username");
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create task
export const createTask = async (req, res) => {
  try {
    const { title, description, priority } = req.body;
    if (!await isTitleValid(title)) {
      return res.status(400).json({ message: "Title must be unique and not a column name" });
    }
    const task = await Task.create({ title, description, priority, updatedBy: req.user.id });
    await logAction("create", req.user.id, task._id, `Created task '${title}'`);
    req.io.emit("task:update");
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update task (with conflict detection)
export const updateTask = async (req, res) => {
  try {
    const { title, description, status, priority, assignedTo, version } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    if (version !== undefined && version !== task.version) {
      // Conflict detected
      return res.status(409).json({
        message: "Conflict detected",
        serverTask: task,
        clientTask: req.body
      });
    }
    if (title && !await isTitleValid(title, req.params.id)) {
      return res.status(400).json({ message: "Title must be unique and not a column name" });
    }
    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    let dragDrop = false;
    if (status && status !== task.status) {
      dragDrop = true;
      task.status = status;
    }
    if (priority) task.priority = priority;
    let assignmentChanged = false;
    if (assignedTo !== undefined && String(task.assignedTo) !== String(assignedTo)) {
      assignmentChanged = true;
      // If assignedTo is null or empty, set to null. Otherwise, convert to ObjectId.
      if (!assignedTo) {
        task.assignedTo = null;
      } else if (typeof assignedTo === 'string' && assignedTo.match(/^[0-9a-fA-F]{24}$/)) {
        task.assignedTo = new mongoose.Types.ObjectId(assignedTo);
      } else {
        task.assignedTo = null;
      }
    }
    if (description !== undefined) task.description = description;
    if (title) task.title = title;
    task.updatedAt = new Date();
    task.updatedBy = req.user.id;
    task.version += 1;
    await task.save();
    if (dragDrop) {
      await logAction("drag-drop", req.user.id, task._id, `Moved to '${task.status}'`);
    } else if (assignmentChanged) {
      await logAction("assign", req.user.id, task._id, `Assigned to user ${assignedTo}`);
    } else {
      await logAction("update", req.user.id, task._id, `Updated task '${task.title}'`);
    }
    req.io.emit("task:update");
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete task
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    await logAction("delete", req.user.id, req.params.id, `Deleted task '${task.title}'`);
    req.io.emit("task:update");
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Smart assign
export const smartAssign = async (req, res) => {
  try {
    // Find all users and their active tasks
    const users = await User.find();
    const tasks = await Task.find({ status: { $ne: "Done" } });
    const taskCount = {};
    users.forEach(u => { taskCount[u._id] = 0; });
    tasks.forEach(t => {
      if (t.assignedTo) taskCount[t.assignedTo] = (taskCount[t.assignedTo] || 0) + 1;
    });
    // Find user with fewest tasks
    let minTasks = Infinity, minUser = null;
    users.forEach(u => {
      if (taskCount[u._id] < minTasks) {
        minTasks = taskCount[u._id];
        minUser = u;
      }
    });
    if (!minUser) return res.status(400).json({ message: "No users found" });
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    task.assignedTo = minUser._id;
    task.updatedAt = new Date();
    task.updatedBy = req.user.id;
    task.version += 1;
    await task.save();
    await logAction("smart-assign", req.user.id, task._id, `Smart assigned to ${minUser.username}`);
    req.io.emit("task:update");
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}; 