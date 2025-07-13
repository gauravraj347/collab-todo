import User from "../models/User.js";

// Get all users (for assignment)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, "_id username");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get current user info
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id, "_id username");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}; 