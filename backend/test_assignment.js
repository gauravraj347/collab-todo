// Simple test script to verify task assignment
import mongoose from "mongoose";
import Task from "./models/Task.js";
import User from "./models/User.js";

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/collab_todo");

async function testAssignment() {
  try {
    // Create a test user
    const user = await User.create({
      username: "testuser",
      password: "hashedpassword"
    });

    // Create a task assigned to the user
    const task = await Task.create({
      title: "Test Task",
      description: "Test description",
      assignedTo: user._id,
      status: "Todo",
      priority: "Medium"
    });

    // Populate and check the assignment
    const populatedTask = await Task.findById(task._id).populate("assignedTo", "username");
    
    console.log("Task:", {
      id: populatedTask._id,
      title: populatedTask.title,
      assignedTo: populatedTask.assignedTo,
      assignedUsername: populatedTask.assignedTo?.username
    });

    console.log("✅ Assignment test passed!");
    
    // Clean up
    await Task.findByIdAndDelete(task._id);
    await User.findByIdAndDelete(user._id);
    
  } catch (error) {
    console.error("❌ Assignment test failed:", error);
  } finally {
    mongoose.disconnect();
  }
}

testAssignment(); 