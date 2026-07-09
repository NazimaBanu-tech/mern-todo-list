import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import taskRoutes from "./routes/tasks.js";

dotenv.config();

const app = express();

const allowedOrigin = process.env.CORS_ORIGIN || "*";
app.use(cors({
  origin: allowedOrigin === "*" ? "*" : allowedOrigin.split(",").map(o => o.trim()),
  credentials: true
}));

app.use(express.json());

app.get("/", (req, res) => res.send("API running ✅"));
app.use("/api/tasks", taskRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT} ✅`));

const dbUri = process.env.MONGODB_URI || process.env.MONGO_URI;
if (!dbUri) {
  console.error("CRITICAL: MONGODB_URI or MONGO_URI environment variable is missing! ❌");
  process.exit(1);
}

mongoose
  .connect(dbUri)
  .then(() => {
    console.log("MongoDB connected ✅");
  })
  .catch((err) => {
    console.error("MongoDB connection error ❌:", err.message);
  });
