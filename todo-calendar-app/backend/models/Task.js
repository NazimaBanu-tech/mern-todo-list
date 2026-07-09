import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  description: {
    type: String,
    default: ""
  },
  category: {
    type: String,
    default: "Personal"
  },
  priority: {
    type: String,
    enum: ["Low", "Medium", "High"],
    default: "Medium"
  },
  dueTime: {
    type: String,
    default: ""
  },
  status: {
    type: String,
    enum: ["To Do", "In Progress", "Completed"],
    default: "To Do"
  },
  tags: {
    type: [String],
    default: []
  },
  notes: {
    type: String,
    default: ""
  },
  archived: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

export default mongoose.model("Task", TaskSchema);

