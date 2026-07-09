import express from "express";
import cors from "cors";
import dotenv from "dotenv";
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
