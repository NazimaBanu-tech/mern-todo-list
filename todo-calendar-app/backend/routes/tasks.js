import express from "express";
import mongoose from "mongoose";
import Task from "../models/Task.js";

const router = express.Router();

// Middleware to check database connection status
router.use((req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      error: "Database offline",
      message: "Lumi server is currently disconnected from MongoDB. Please ensure your local MongoDB database service is running on port 27017."
    });
  }
  next();
});

// get tasks
router.get("/", async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (err) {
    console.error("GET /api/tasks error:", err);
    res.status(500).json({ error: "Failed to fetch tasks", message: err.message });
  }
});

// add task
router.post("/", async (req, res) => {
  try {
    console.log("POST /api/tasks body:", req.body);
    const newTask = new Task(req.body);
    const saved = await newTask.save();
    console.log("POST /api/tasks success:", saved._id);
    res.json(saved);
  } catch (err) {
    console.error("POST /api/tasks error:", err);
    res.status(400).json({ error: "Failed to create task", message: err.message });
  }
});

// delete task
router.delete("/:id", async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: "Task deleted" });
  } catch (err) {
    console.error(`DELETE /api/tasks/${req.params.id} error:`, err);
    res.status(500).json({ error: "Failed to delete task", message: err.message });
  }
});

// update task
router.put("/:id", async (req, res) => {
  try {
    const updated = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    console.error(`PUT /api/tasks/${req.params.id} error:`, err);
    res.status(400).json({ error: "Failed to update task", message: err.message });
  }
});

export default router;
