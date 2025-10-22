"use client";

import { Task, useTasks } from "@/hooks/useTasks";
import { useState } from "react";
import { motion } from "framer-motion";
import AlertDialog from "./AlertDialog";
import ConfirmDialog from "./ConfirmDialog";

type TasksProps = {
  userId?: string;
  onBackToDashboard: () => void;
};

type TaskErrors = {
  title?: string;
  dueDate?: string;
};

const Tasks = ({ userId, onBackToDashboard }: TasksProps) => {
  const { tasks, createTask, updateTask, deleteTask } = useTasks(userId);
  const [isCreating, setIsCreating] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium" as Task["priority"],
    dueDate: "",
  });
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");
  const [alertMsg, setAlertMsg] = useState<string | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [formErrors, setFormErrors] = useState<TaskErrors>({});

  const resetForm = () => {
    setNewTask({
      title: "",
      description: "",
      priority: "medium",
      dueDate: "",
    });
    setIsCreating(false);
    setEditingTask(null);
    setFormErrors({});
  };

  const validateForm = () => {
    const errors: TaskErrors = {};
    if (!newTask.title.trim()) {
      errors.title = "Please give your task a sparkling title.";
    }
    if (newTask.dueDate) {
      const dueValid = !Number.isNaN(Date.parse(newTask.dueDate));
      if (!dueValid) {
        errors.dueDate = "Pick a valid due date or leave it blank.";
      }
    }
    setFormErrors(errors);
    return errors;
  };

  const handleCreate = () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setAlertMsg("Please fix the highlighted task fields before saving.");
      return;
    }

    createTask({
      title: newTask.title.trim(),
      description: newTask.description.trim(),
      priority: newTask.priority,
      dueDate: newTask.dueDate ? new Date(newTask.dueDate).toISOString() : undefined,
      status: "pending",
      userId,
    });

    resetForm();
  };

  const handleUpdate = () => {
    if (!editingTask) return;
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setAlertMsg("Please fix the highlighted task fields before updating.");
      return;
    }

    updateTask(editingTask.id, {
      title: newTask.title.trim(),
      description: newTask.description.trim(),
      priority: newTask.priority,
      dueDate: newTask.dueDate ? new Date(newTask.dueDate).toISOString() : undefined,
    });

    resetForm();
  };

  const startEdit = (task: Task) => {
    setEditingTask(task);
    setNewTask({
      title: task.title,
      description: task.description,
      priority: task.priority,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "",
    });
    setFormErrors({});
    setIsCreating(true);
  };

  const updateStatus = (task: Task, status: Task["status"]) => {
    updateTask(task.id, { status });
  };

  const filteredTasks = tasks.filter((task) =>
    filter === "all" ? true : task.status === filter
  );

  const getStatusBadge = (status: Task["status"]) => {
    switch (status) {
      case "pending":
        return "bg-rose-100 text-rose-500";
      case "completed":
        return "bg-emerald-100 text-emerald-500";
      default:
        return "bg-rose-100 text-rose-500";
    }
  };

  const getPriorityBadge = (priority: Task["priority"]) => {
    switch (priority) {
      case "high":
        return "bg-rose-100 text-rose-500";
      case "medium":
        return "bg-amber-100 text-amber-500";
      case "low":
        return "bg-emerald-100 text-emerald-500";
      default:
        return "bg-rose-100 text-rose-500";
    }
  };

  return (
    <div className="glass-card rounded-3xl border border-rose-200/60 p-6 shadow-lg shadow-rose-100">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-3 text-3xl font-bold text-rose-600">
            <span className="text-4xl">✅</span>
            Tasks
          </h2>
          <p className="text-sm text-rose-500">Plan your days with polished precision.</p>
        </div>
        <button
          onClick={() => {
            setIsCreating(true);
            setFormErrors({});
          }}
          className="rounded-2xl bg-gradient-to-r from-rose-400 via-pink-300 to-amber-300 px-5 py-2 text-sm font-semibold text-rose-900 shadow-md shadow-rose-200 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-rose-200"
        >
          + New Task
        </button>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {(["all", "pending", "completed"] as const).map((filterType) => (
          <button
            key={filterType}
            onClick={() => setFilter(filterType)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-rose-200 ${
              filter === filterType
                ? "bg-rose-500 text-white shadow-md shadow-rose-200"
                : "border border-rose-200 bg-white/70 text-rose-500 hover:border-rose-300"
            }`}
          >
            {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
          </button>
        ))}
      </div>

      {isCreating && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-2xl border border-rose-200/70 bg-white/85 p-5 shadow-md"
        >
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-semibold text-rose-500" htmlFor="task-title">
                Title
              </label>
              <input
                id="task-title"
                type="text"
                placeholder="Task title..."
                value={newTask.title}
                onChange={(e) => {
                  const value = e.target.value;
                  setNewTask((prev) => ({ ...prev, title: value }));
                  if (formErrors.title && value.trim()) {
                    setFormErrors((prev) => ({ ...prev, title: undefined }));
                  }
                }}
                className={`w-full rounded-xl border px-4 py-3 text-rose-700 placeholder:text-rose-300 focus:outline-none focus:ring-2 ${
                  formErrors.title
                    ? "border-rose-400 bg-rose-50 focus:ring-rose-300"
                    : "border-rose-200 bg-white/70 focus:border-rose-300 focus:ring-rose-200"
                }`}
              />
              {formErrors.title && (
                <p className="mt-1 text-sm text-rose-500">{formErrors.title}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-rose-500" htmlFor="task-description">
                Description
              </label>
              <textarea
                id="task-description"
                placeholder="Task description..."
                value={newTask.description}
                onChange={(e) =>
                  setNewTask((prev) => ({ ...prev, description: e.target.value }))
                }
                className="h-24 w-full resize-none rounded-xl border border-rose-200 bg-white/70 px-4 py-3 text-rose-700 placeholder:text-rose-300 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-200"
              />
            </div>

            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[140px]">
                <label className="mb-1 block text-sm font-semibold text-rose-500" htmlFor="task-priority">
                  Priority
                </label>
                <select
                  id="task-priority"
                  value={newTask.priority}
                  onChange={(e) =>
                    setNewTask((prev) => ({
                      ...prev,
                      priority: e.target.value as Task["priority"],
                    }))
                  }
                  className="w-full rounded-xl border border-rose-200 bg-white/70 px-4 py-3 text-rose-700 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-200"
                >
                  <option value="low">Low priority</option>
                  <option value="medium">Medium priority</option>
                  <option value="high">High priority</option>
                </select>
              </div>

              <div className="flex-1 min-w-[140px]">
                <label className="mb-1 block text-sm font-semibold text-rose-500" htmlFor="task-due-date">
                  Due date
                </label>
                <input
                  id="task-due-date"
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => {
                    const value = e.target.value;
                    setNewTask((prev) => ({ ...prev, dueDate: value }));
                    if (formErrors.dueDate && value) {
                      setFormErrors((prev) => ({ ...prev, dueDate: undefined }));
                    }
                  }}
                  className={`w-full rounded-xl border px-4 py-3 text-rose-700 focus:outline-none focus:ring-2 ${
                    formErrors.dueDate
                      ? "border-rose-400 bg-rose-50 focus:ring-rose-300"
                      : "border-rose-200 bg-white/70 focus:border-rose-300 focus:ring-rose-200"
                  }`}
                />
                {formErrors.dueDate && (
                  <p className="mt-1 text-sm text-rose-500">{formErrors.dueDate}</p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={editingTask ? handleUpdate : handleCreate}
              className="rounded-xl bg-gradient-to-r from-rose-400 via-pink-400 to-amber-300 px-4 py-2 text-sm font-semibold text-rose-900 shadow-md shadow-rose-200 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-rose-200"
            >
              {editingTask ? "Update" : "Create"}
            </button>
            <button
              onClick={resetForm}
              className="rounded-xl border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-400 transition-colors hover:border-rose-300 hover:text-rose-500"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      <div className="max-h-96 space-y-3 overflow-y-auto pr-1">
        {filteredTasks.map((task) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-rose-200/70 bg-white/80 p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-rose-300 hover:shadow-md"
          >
            <div className="mb-2 flex items-start justify-between gap-4">
              <h3 className="text-lg font-semibold text-rose-600">{task.title}</h3>
              <div className="flex gap-2 text-lg">
                <button
                  onClick={() => startEdit(task)}
                  className="rounded-full bg-rose-100 px-2 py-1 text-rose-500 transition-colors hover:bg-rose-200"
                  aria-label="Edit task"
                >
                  ✏️
                </button>
                <button
                  onClick={() => setTaskToDelete(task)}
                  className="rounded-full bg-rose-100 px-2 py-1 text-rose-500 transition-colors hover:bg-rose-200"
                  aria-label="Delete task"
                >
                  🗑️
                </button>
              </div>
            </div>

            {task.description && (
              <p className="mb-3 text-sm text-rose-500">{task.description}</p>
            )}

            <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadge(task.status)}`}>
                  {task.status === "pending" ? "Pending" : "Completed"}
                </span>
                {task.status === "pending" ? (
                  <button
                    onClick={() => updateStatus(task, "completed")}
                    className="text-xs font-semibold text-emerald-500 transition-colors hover:text-emerald-600"
                  >
                    Mark completed
                  </button>
                ) : (
                  <button
                    onClick={() => updateStatus(task, "pending")}
                    className="text-xs font-semibold text-amber-500 transition-colors hover:text-amber-600"
                  >
                    Mark pending
                  </button>
                )}
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getPriorityBadge(task.priority)}`}>
                  {task.priority} priority
                </span>
              </div>
              {task.dueDate && (
                <span className="text-xs font-semibold text-rose-300">
                  Due: {new Date(task.dueDate).toLocaleDateString()}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between text-xs text-rose-300">
              <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
              <span>Updated: {new Date(task.updatedAt).toLocaleDateString()}</span>
            </div>
          </motion.div>
        ))}

        {filteredTasks.length === 0 && (
          <div className="py-10 text-center text-rose-400">
            {filter === "all"
              ? "No tasks yet. Create your first task!"
              : `No ${filter} tasks right now.`}
          </div>
        )}
      </div>

      <div className="mt-6">
        <button
          onClick={onBackToDashboard}
          className="text-sm font-semibold text-rose-500 transition-colors hover:text-rose-600"
        >
          ← Back to dashboard
        </button>
      </div>

      <ConfirmDialog
        isOpen={!!taskToDelete}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        onConfirm={() => {
          if (taskToDelete) {
            deleteTask(taskToDelete.id);
            setTaskToDelete(null);
          }
        }}
        onCancel={() => setTaskToDelete(null)}
        confirmText="Delete"
      />

      <AlertDialog
        isOpen={!!alertMsg}
        title="We spotted a hiccup"
        message={alertMsg || ""}
        onClose={() => setAlertMsg(null)}
      />
    </div>
  );
};

export default Tasks;
