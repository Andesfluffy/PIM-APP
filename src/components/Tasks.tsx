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
      errors.title = "Please add a task title.";
    }
    if (newTask.dueDate) {
      const dueValid = !Number.isNaN(Date.parse(newTask.dueDate));
      if (!dueValid) {
        errors.dueDate = "Enter a valid due date or leave the field blank.";
      }
    }
    setFormErrors(errors);
    return errors;
  };

  const handleCreate = () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setAlertMsg("Resolve the highlighted fields before saving the task.");
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
      setAlertMsg("Resolve the highlighted fields before updating the task.");
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
    <div className="rounded-[32px] border border-emerald-100/70 bg-white/80 p-8 shadow-[0_40px_80px_-55px_rgba(12,74,48,0.6)] backdrop-blur-xl">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-3 rounded-full bg-emerald-100/80 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.35em] text-emerald-500">
            Tasks
          </div>
          <h2 className="text-3xl text-emerald-800">Plan with clarity and momentum</h2>
          <p className="type-subtle text-sm text-emerald-600/80">
            Structure your day with elegant boards that balance priorities and progress.
          </p>
        </div>
        <button
          onClick={() => {
            setIsCreating(true);
            setFormErrors({});
          }}
          className="rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-lime-300 px-6 py-3 text-sm font-semibold text-emerald-900 shadow-[0_18px_36px_-20px_rgba(16,94,67,0.45)] transition-transform duration-300 hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-emerald-200"
        >
          Add task
        </button>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {(["all", "pending", "completed"] as const).map((filterType) => (
          <button
            key={filterType}
            onClick={() => setFilter(filterType)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-200 ${
              filter === filterType
                ? "bg-emerald-600 text-white shadow-[0_15px_30px_-20px_rgba(16,94,67,0.5)]"
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
          className="mb-6 rounded-2xl border border-emerald-100/70 bg-white/85 p-6 shadow-[0_20px_45px_-30px_rgba(12,74,48,0.45)]"
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-semibold text-emerald-600" htmlFor="task-title">
                Title
              </label>
              <input
                id="task-title"
                type="text"
                placeholder="What needs to get done?"
                value={newTask.title}
                onChange={(e) => {
                  const value = e.target.value;
                  setNewTask((prev) => ({ ...prev, title: value }));
                  if (formErrors.title && value.trim()) {
                    setFormErrors((prev) => ({ ...prev, title: undefined }));
                  }
                }}
                className={`w-full rounded-xl border px-4 py-3 text-sm text-emerald-700 placeholder:text-emerald-200 focus:outline-none focus:ring-2 ${
                  formErrors.title
                    ? "border-emerald-400 bg-emerald-50 focus:ring-emerald-300"
                    : "border-emerald-100 bg-white/80 focus:border-emerald-300 focus:ring-emerald-200"
                }`}
              />
              {formErrors.title && (
                <p className="mt-1 text-sm text-emerald-600">{formErrors.title}</p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-emerald-600" htmlFor="task-priority">
                Priority
              </label>
              <select
                id="task-priority"
                value={newTask.priority}
                onChange={(e) =>
                  setNewTask((prev) => ({ ...prev, priority: e.target.value as Task["priority"] }))
                }
                className="w-full rounded-xl border border-emerald-100 bg-white/80 px-4 py-3 text-sm text-emerald-700 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-emerald-600" htmlFor="task-due-date">
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
                    const dueValid = !Number.isNaN(Date.parse(value));
                    if (dueValid) {
                      setFormErrors((prev) => ({ ...prev, dueDate: undefined }));
                    }
                  }
                }}
                className={`w-full rounded-xl border px-4 py-3 text-sm text-emerald-700 focus:outline-none focus:ring-2 ${
                  formErrors.dueDate
                    ? "border-emerald-400 bg-emerald-50 focus:ring-emerald-300"
                    : "border-emerald-100 bg-white/80 focus:border-emerald-300 focus:ring-emerald-200"
                }`}
              />
              {formErrors.dueDate && (
                <p className="mt-1 text-sm text-emerald-600">{formErrors.dueDate}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-semibold text-emerald-600" htmlFor="task-description">
                Description
              </label>
              <textarea
                id="task-description"
                placeholder="Outline the steps or notes for this task"
                value={newTask.description}
                onChange={(e) =>
                  setNewTask((prev) => ({ ...prev, description: e.target.value }))
                }
                className="h-32 w-full resize-none rounded-xl border border-emerald-100 bg-white/80 px-4 py-3 text-sm text-emerald-700 placeholder:text-emerald-200 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              />
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={editingTask ? handleUpdate : handleCreate}
              className="rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-[0_18px_35px_-22px_rgba(16,94,67,0.55)] transition-transform duration-200 hover:-translate-y-0.5 hover:bg-emerald-700"
            >
              {editingTask ? "Update task" : "Create task"}
            </button>
            <button
              onClick={resetForm}
              className="rounded-xl border border-emerald-200 bg-white/80 px-5 py-2 text-sm font-semibold text-emerald-500 transition-colors hover:border-emerald-300 hover:text-emerald-600"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      <div className="grid max-h-[420px] grid-cols-1 gap-4 overflow-y-auto pr-1 md:grid-cols-2">
        {filteredTasks.map((task) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="group rounded-2xl border border-emerald-100/70 bg-white/85 p-5 shadow-sm shadow-emerald-50 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_20px_35px_-30px_rgba(12,74,48,0.55)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <p className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${getPriorityBadge(task.priority)}`}>
                  <span className="h-2 w-2 rounded-full bg-white/80" />
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} priority
                </p>
                <h3 className="text-lg font-semibold text-emerald-800">{task.title}</h3>
                {task.description && (
                  <p className="type-subtle text-sm text-emerald-600/90">{task.description}</p>
                )}
              </div>
              <div className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadge(task.status)}`}>
                {task.status === "completed" ? "Completed" : "In progress"}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-emerald-300">
              <span>
                Updated {new Date(task.updatedAt ?? task.createdAt).toLocaleDateString()}
              </span>
              {task.dueDate && (
                <span>Due {new Date(task.dueDate).toLocaleDateString()}</span>
              )}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                onClick={() => updateStatus(task, task.status === "completed" ? "pending" : "completed")}
                className="rounded-xl border border-emerald-200 bg-white/80 px-4 py-2 text-xs font-semibold text-emerald-600 transition-colors hover:border-emerald-300 hover:text-emerald-700"
              >
                Mark as {task.status === "completed" ? "pending" : "completed"}
              </button>
              <button
                onClick={() => startEdit(task)}
                className="rounded-xl border border-emerald-200 bg-white/80 px-4 py-2 text-xs font-semibold text-emerald-600 transition-colors hover:border-emerald-300 hover:text-emerald-700"
              >
                Edit
              </button>
              <button
                onClick={() => setTaskToDelete(task)}
                className="rounded-xl border border-transparent bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-500 transition-colors hover:bg-emerald-100"
              >
                Delete
              </button>
            </div>
          </motion.div>
        ))}

        {filteredTasks.length === 0 && (
          <div className="col-span-full flex h-48 items-center justify-center rounded-2xl border border-dashed border-emerald-100 text-center text-emerald-300">
            {filter === "all"
              ? "No tasks yet. Create your first plan."
              : "Nothing matches this filter right now."}
          </div>
        )}
      </div>

      <div className="mt-6">
        <button
          onClick={onBackToDashboard}
          className="type-subtle text-sm font-semibold text-emerald-600 transition-colors hover:text-emerald-700"
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
        title="Action required"
        message={alertMsg || ""}
        onClose={() => setAlertMsg(null)}
      />
    </div>
  );
};

export default Tasks;
