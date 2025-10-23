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
        return "bg-emerald-100 text-emerald-600";
      case "completed":
        return "bg-emerald-600 text-white";
      default:
        return "bg-emerald-100 text-emerald-600";
    }
  };

  const getPriorityBadge = (priority: Task["priority"]) => {
    switch (priority) {
      case "high":
        return "bg-emerald-500/90 text-white";
      case "medium":
        return "bg-teal-100 text-teal-600";
      case "low":
        return "bg-lime-100 text-lime-600";
      default:
        return "bg-emerald-100 text-emerald-600";
    }
  };

  return (
    <div className="glass-card rounded-3xl border border-emerald-200/70 bg-white/80 p-6 shadow-[0_32px_70px_-40px_rgba(12,74,48,0.55)] backdrop-blur">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-3 text-3xl font-bold text-emerald-600">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
              <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M4 7a3 3 0 013-3h10a3 3 0 013 3v10a3 3 0 01-3 3H7a3 3 0 01-3-3z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            Tasks
          </h2>
          <p className="text-sm text-emerald-500">Plan your days with polished precision.</p>
        </div>
        <button
          onClick={() => {
            setIsCreating(true);
            setFormErrors({});
          }}
          className="rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-lime-300 px-5 py-2 text-sm font-semibold text-emerald-900 shadow-md shadow-emerald-200 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-emerald-200"
        >
          + New Task
        </button>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {(["all", "pending", "completed"] as const).map((filterType) => (
          <button
            key={filterType}
            onClick={() => setFilter(filterType)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-200 ${
              filter === filterType
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-200"
                : "border border-emerald-200 bg-white/70 text-emerald-600 hover:border-emerald-300"
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
          className="mb-6 rounded-2xl border border-emerald-200/70 bg-white/85 p-5 shadow-lg shadow-emerald-100"
        >
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-semibold text-emerald-600" htmlFor="task-title">
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
                className={`w-full rounded-xl border px-4 py-3 text-emerald-700 placeholder:text-emerald-300 focus:outline-none focus:ring-2 ${
                  formErrors.title
                    ? "border-emerald-400 bg-emerald-50 focus:ring-emerald-300"
                    : "border-emerald-200 bg-white/70 focus:border-emerald-300 focus:ring-emerald-200"
                }`}
              />
              {formErrors.title && (
                <p className="mt-1 text-sm text-emerald-600">{formErrors.title}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-emerald-600" htmlFor="task-description">
                Description
              </label>
              <textarea
                id="task-description"
                placeholder="Task description..."
                value={newTask.description}
                onChange={(e) =>
                  setNewTask((prev) => ({ ...prev, description: e.target.value }))
                }
                className="h-24 w-full resize-none rounded-xl border border-emerald-200 bg-white/70 px-4 py-3 text-emerald-700 placeholder:text-emerald-300 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              />
            </div>

            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[140px]">
                <label className="mb-1 block text-sm font-semibold text-emerald-600" htmlFor="task-priority">
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
                  className="w-full rounded-xl border border-emerald-200 bg-white/70 px-4 py-3 text-emerald-700 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                >
                  <option value="low">Low priority</option>
                  <option value="medium">Medium priority</option>
                  <option value="high">High priority</option>
                </select>
              </div>

              <div className="flex-1 min-w-[140px]">
                <label className="mb-1 block text-sm font-semibold text-emerald-600" htmlFor="task-due-date">
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
                  className={`w-full rounded-xl border px-4 py-3 text-emerald-700 focus:outline-none focus:ring-2 ${
                    formErrors.dueDate
                      ? "border-emerald-400 bg-emerald-50 focus:ring-emerald-300"
                      : "border-emerald-200 bg-white/70 focus:border-emerald-300 focus:ring-emerald-200"
                  }`}
                />
                {formErrors.dueDate && (
                  <p className="mt-1 text-sm text-emerald-600">{formErrors.dueDate}</p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={editingTask ? handleUpdate : handleCreate}
              className="rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-lime-300 px-4 py-2 text-sm font-semibold text-emerald-900 shadow-md shadow-emerald-200 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-emerald-200"
            >
              {editingTask ? "Update" : "Create"}
            </button>
            <button
              onClick={resetForm}
              className="rounded-xl border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-500 transition-colors hover:border-emerald-300 hover:text-emerald-600"
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
            className="rounded-2xl border border-emerald-200/70 bg-white/80 p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-md"
          >
            <div className="mb-2 flex items-start justify-between gap-4">
              <h3 className="text-lg font-semibold text-emerald-700">{task.title}</h3>
              <div className="flex gap-2 text-lg">
                <button
                  onClick={() => startEdit(task)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 transition-all hover:bg-emerald-200"
                  aria-label="Edit task"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M16.862 4.487l2.651 2.651m-9.193 9.193l-3.34.689.688-3.34 9.194-9.193a1.875 1.875 0 012.651 2.651l-9.193 9.193z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button
                  onClick={() => setTaskToDelete(task)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 transition-all hover:bg-emerald-200"
                  aria-label="Delete task"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 7h12M9 7V5.5A1.5 1.5 0 0110.5 4h3A1.5 1.5 0 0115 5.5V7m1 0v11a2 2 0 01-2 2H10a2 2 0 01-2-2V7m3 4v6m4-6v6" />
                  </svg>
                </button>
              </div>
            </div>

            {task.description && (
              <p className="mb-3 text-sm text-emerald-600">{task.description}</p>
            )}

            <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadge(task.status)}`}>
                  {task.status === "pending" ? "Pending" : "Completed"}
                </span>
                {task.status === "pending" ? (
                  <button
                    onClick={() => updateStatus(task, "completed")}
                    className="text-xs font-semibold text-emerald-600 transition-colors hover:text-emerald-700"
                  >
                    Mark completed
                  </button>
                ) : (
                  <button
                    onClick={() => updateStatus(task, "pending")}
                    className="text-xs font-semibold text-emerald-600 transition-colors hover:text-emerald-700"
                  >
                    Mark pending
                  </button>
                )}
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getPriorityBadge(task.priority)}`}>
                  {task.priority} priority
                </span>
              </div>
              {task.dueDate && (
                <span className="text-xs font-semibold text-emerald-400">
                  Due: {new Date(task.dueDate).toLocaleDateString()}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between text-xs text-emerald-400">
              <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
              {task.updatedAt && (
                <span>Updated: {new Date(task.updatedAt).toLocaleDateString()}</span>
              )}
            </div>
          </motion.div>
        ))}

        {filteredTasks.length === 0 && (
          <div className="py-10 text-center text-emerald-400">
            {filter === "all"
              ? "No tasks yet. Create your first task!"
              : `No ${filter} tasks right now.`}
          </div>
        )}
      </div>

      <div className="mt-6">
        <button
          onClick={onBackToDashboard}
          className="text-sm font-semibold text-emerald-600 transition-colors hover:text-emerald-700"
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
