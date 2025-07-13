import mongoose from "mongoose";

const actionLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  task: { type: mongoose.Schema.Types.ObjectId, ref: "Task" },
  details: { type: String },
  createdAt: { type: Date, default: Date.now },
});

actionLogSchema.index({ createdAt: -1 });

export default mongoose.model("ActionLog", actionLogSchema);
