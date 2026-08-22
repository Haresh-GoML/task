import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db";
import authRoutes from "./routes/auth";
import taskRoutes from "./routes/tasks";

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);

// ==========================
// MongoDB Connection
// ==========================

connectDB();

// ==========================
// Middleware
// ==========================

app.use(express.json());

// CORS Configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

// ==========================
// Routes
// ==========================

app.use("/auth", authRoutes);
app.use("/tasks", taskRoutes);

// ==========================
// Health Check
// ==========================

app.get("/", (req, res) => {
  res.json({ message: "Task Manager API is running" });
});

// ==========================
// START SERVER
// ==========================

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
