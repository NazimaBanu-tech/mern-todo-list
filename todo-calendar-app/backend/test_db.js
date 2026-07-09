import mongoose from "mongoose";
import dotenv from "dotenv";
import Task from "./models/Task.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/todoapp";
console.log("Connecting to:", MONGO_URI);

try {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB!");

  const testTask = new Task({
    text: "Test Task via Script",
    date: "2026-07-08",
    completed: false
  });

  const saved = await testTask.save();
  console.log("Task saved successfully! ID:", saved._id);
} catch (err) {
  console.error("CRITICAL ERROR during save:", err);
} finally {
  await mongoose.disconnect();
  console.log("Disconnected.");
}
