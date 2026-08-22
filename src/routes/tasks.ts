import { Router, Response } from "express";
import { requireAuth, AuthRequest } from "../middleware/auth";
import Task from "../models/Task";

const router = Router();

// ==========================
// GET ALL TASKS (User's own tasks only)
// GET /tasks
// ==========================

router.get("/", requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // CRITICAL: Only fetch tasks belonging to the logged-in user
    const tasks = await Task.find({ userId: req.user!.userId });

    res.status(200).json(tasks);
  } catch (error) {
    console.error("Get tasks error:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
});

// ==========================
// CREATE TASK
// POST /tasks
// ==========================

router.post("/", requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title } = req.body;

    // Check title
    if (!title) {
      res.status(400).json({
        message: "Title is required",
      });
      return;
    }

    // CRITICAL: Create task with userId from JWT, NOT from request body
    const newTask = await Task.create({
      title: title,
      done: false,
      userId: req.user!.userId,
    });

    res.status(201).json(newTask);
  } catch (error) {
    console.error("Create task error:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
});

// ==========================
// UPDATE TASK
// PUT /tasks/:id
// ==========================

router.put("/:id", requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const taskId = req.params.id;
    const { title, done } = req.body;

    // Build update object
    const updateData: { title?: string; done?: boolean } = {};
    if (title !== undefined) updateData.title = title;
    if (done !== undefined) updateData.done = done;

    // CRITICAL: Update ONLY if task belongs to the logged-in user
    const updatedTask = await Task.findOneAndUpdate(
      {
        _id: taskId,
        userId: req.user!.userId,
      },
      updateData,
      {
        new: true,
      }
    );

    // Task not found or doesn't belong to user
    if (!updatedTask) {
      res.status(404).json({
        message: "Task not found",
      });
      return;
    }

    res.status(200).json(updatedTask);
  } catch (error) {
    console.error("Update task error:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
});

// ==========================
// DELETE TASK
// DELETE /tasks/:id
// ==========================

router.delete("/:id", requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const taskId = req.params.id;

    // CRITICAL: Delete ONLY if task belongs to the logged-in user
    const deletedTask = await Task.findOneAndDelete({
      _id: taskId,
      userId: req.user!.userId,
    });

    // Task not found or doesn't belong to user
    if (!deletedTask) {
      res.status(404).json({
        message: "Task not found",
      });
      return;
    }

    res.status(200).json({
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("Delete task error:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
});

export default router;
