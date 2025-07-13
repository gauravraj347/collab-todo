import ActionLog from "../models/ActionLog.js";

// Get last 20 actions
export const getRecentActions = async (req, res) => {
  try {
    const actions = await ActionLog.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .populate("user", "username")
      .populate("task", "title");
    res.json(actions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}; 