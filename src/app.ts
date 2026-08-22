import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth";
import taskRoutes from "./routes/tasks";

const app = express();

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
// Error Handler
// ==========================

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Error:", err);
  res.status(500).json({ message: "Internal server error" });
});

export default app;
