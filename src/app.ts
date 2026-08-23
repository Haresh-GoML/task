import express, {
  Request,
  Response,
  NextFunction
} from "express";

import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth";
import taskRoutes from "./routes/tasks";

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// CORS
app.use(
  cors({
    origin:
      process.env.FRONTEND_URL ||
      "http://localhost:5173",
    credentials: true,
  })
);

// Routes
app.use("/auth", authRoutes);
app.use("/tasks", taskRoutes);

// Health check
app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Task Manager API is running",
  });
});

// Error handler
app.use(
  (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    console.error("Error:", err);

    res.status(500).json({
      message: "Internal server error",
    });
  }
);

export default app;