import express from "express";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const router = express.Router();
const DATA_FILE = path.join(process.cwd(), "tasks.json");

// Helper to read tasks
const readTasksFromFile = () => {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify([]));
      return [];
    }
    const data = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(data || "[]");
  } catch (err) {
    console.error("Error reading file database:", err);
    return [];
  }
};

// Helper to write tasks
const writeTasksToFile = (tasks) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2));
  } catch (err) {
    console.error("Error writing to file database:", err);
  }
};

// get tasks
router.get("/", (req, res) => {
  try {
    const tasks = readTasksFromFile();
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch tasks", message: err.message });
  }
});

// add task
router.post("/", (req, res) => {
  try {
    const tasks = readTasksFromFile();
    const newTask = {
      _id: crypto.randomUUID(),
      text: req.body.text,
      date: req.body.date,
      completed: req.body.completed || false,
      description: req.body.description || "",
      category: req.body.category || "Personal",
      priority: req.body.priority || "Medium",
      dueTime: req.body.dueTime || "",
      status: req.body.status || "To Do",
      tags: req.body.tags || [],
      notes: req.body.notes || "",
      archived: req.body.archived || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    tasks.push(newTask);
    writeTasksToFile(tasks);
    res.json(newTask);
  } catch (err) {
    res.status(400).json({ error: "Failed to create task", message: err.message });
  }
});

// delete task
router.delete("/:id", (req, res) => {
  try {
    let tasks = readTasksFromFile();
    tasks = tasks.filter(t => t._id !== req.params.id);
    writeTasksToFile(tasks);
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete task", message: err.message });
  }
});

// update task
router.put("/:id", (req, res) => {
  try {
    const tasks = readTasksFromFile();
    const index = tasks.findIndex(t => t._id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: "Task not found" });
    }
    tasks[index] = {
      ...tasks[index],
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    writeTasksToFile(tasks);
    res.json(tasks[index]);
  } catch (err) {
    res.status(400).json({ error: "Failed to update task", message: err.message });
  }
});

export default router;
