import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: "" },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  status: { type: String, enum: ["Todo", "In Progress", "Done"], default: "Todo" },
  priority: { type: String, enum: ["Low", "Medium", "High"], default: "Medium" },
  updatedAt: { type: Date, default: Date.now },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  version: { type: Number, default: 1 }, // for conflict detection
});


taskSchema.index({ title: 1 }, { unique: true });

export default mongoose.model("Task", taskSchema);
