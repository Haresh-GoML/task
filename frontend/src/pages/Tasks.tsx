import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { taskService, authService } from "../services/api";
import type { Task } from "../services/api";
import { useAuth } from "../context/AuthContext";

const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskTitle, setEditingTaskTitle] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { logout, refreshToken } = useAuth();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const fetchedTasks = await taskService.getTasks();
      setTasks(fetchedTasks);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch tasks");
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) {
      setError("Task title is required");
      return;
    }

    setLoading(true);
    try {
      const newTask = await taskService.createTask({ title: newTaskTitle });
      setTasks([...tasks, newTask]);
      setNewTaskTitle("");
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDone = async (task: Task) => {
    try {
      const updatedTask = await taskService.updateTask(task._id, {
        done: !task.done,
      });
      setTasks(tasks.map((t) => (t._id === task._id ? updatedTask : t)));
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update task");
    }
  };

  const handleStartEdit = (task: Task) => {
    setEditingTaskId(task._id);
    setEditingTaskTitle(task.title);
  };

  const handleSaveEdit = async (taskId: string) => {
    if (!editingTaskTitle.trim()) {
      setError("Task title cannot be empty");
      return;
    }

    try {
      const updatedTask = await taskService.updateTask(taskId, {
        title: editingTaskTitle,
      });
      setTasks(tasks.map((t) => (t._id === taskId ? updatedTask : t)));
      setEditingTaskId(null);
      setEditingTaskTitle("");
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update task");
    }
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null);
    setEditingTaskTitle("");
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm("Are you sure you want to delete this task?")) {
      return;
    }

    try {
      await taskService.deleteTask(taskId);
      setTasks(tasks.filter((t) => t._id !== taskId));
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete task");
    }
  };

  const handleLogout = async () => {
    try {
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
      logout();
      navigate("/login");
    } catch (err) {
      // Even if logout API fails, clear local state
      logout();
      navigate("/login");
    }
  };

  return (
    <div className="tasks-container">
      <div className="tasks-header">
        <h1>My Tasks</h1>
        <button onClick={handleLogout} className="btn-logout">
          Logout
        </button>
      </div>

      <form onSubmit={handleCreateTask} className="task-form">
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="Enter task title"
          className="task-input"
        />
        <button type="submit" disabled={loading} className="btn-add">
          {loading ? "Adding..." : "Add Task"}
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}

      <div className="tasks-list">
        {tasks.length === 0 ? (
          <p className="no-tasks">No tasks yet. Create your first task!</p>
        ) : (
          tasks.map((task) => (
            <div key={task._id} className="task-item">
              <input
                type="checkbox"
                checked={task.done}
                onChange={() => handleToggleDone(task)}
                className="task-checkbox"
              />

              {editingTaskId === task._id ? (
                <div className="task-edit">
                  <input
                    type="text"
                    value={editingTaskTitle}
                    onChange={(e) => setEditingTaskTitle(e.target.value)}
                    className="task-input-edit"
                  />
                  <button
                    onClick={() => handleSaveEdit(task._id)}
                    className="btn-save"
                  >
                    Save
                  </button>
                  <button onClick={handleCancelEdit} className="btn-cancel">
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <span
                    className={`task-title ${task.done ? "task-done" : ""}`}
                  >
                    {task.title}
                  </span>
                  <div className="task-actions">
                    <button
                      onClick={() => handleStartEdit(task)}
                      className="btn-edit"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task._id)}
                      className="btn-delete"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Tasks;
