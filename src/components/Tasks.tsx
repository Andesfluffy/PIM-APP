"use client";

import { Task, useTasks } from "@/hooks/useTasks";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import AlertDialog from "./AlertDialog";
import ConfirmDialog from "./ConfirmDialog";

type TasksProps = {
  userId?: string;
};

type TaskErrors = {
  title?: string;
  dueDate?: string;
};

const Tasks = ({ userId }: TasksProps) => {
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
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [alertMsg, setAlertMsg] = useState<string | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [formErrors, setFormErrors] = useState<TaskErrors>({});

  // Persist view mode selection
  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("tasks_view_mode") : null;
    if (saved === "grid" || saved === "list") setViewMode(saved);
  }, []);
  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem("tasks_view_mode", viewMode);
  }, [viewMode]);

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

  const filteredTasks = useMemo(
    () => tasks.filter((task) => (filter === "all" ? true : task.status === filter)),
    [tasks, filter]
  );

  const getStatusBadge = (status: Task["status"]) => {
    switch (status) {
      case "pending":
        return "bg-naples-yellow-900 text-oxford-blue-500";
      case "completed":
        return "bg-tea-green-500 text-oxford-blue-500";
      default:
        return "bg-naples-yellow-900 text-oxford-blue-500";
    }
  };

  const getPriorityBadge = (priority: Task["priority"]) => {
    switch (priority) {
      case "high":
        return "bg-red-crayola-500 text-white";
      case "medium":
        return "bg-naples-yellow-900 text-oxford-blue-500";
      case "low":
        return "bg-tea-green-900 text-oxford-blue-500";
      default:
        return "bg-naples-yellow-900 text-oxford-blue-500";
    }
  };

  return (
    <div className="rounded-[32px] border border-tea-green-700 bg-white/85 p-8 shadow-[0_40px_80px_-55px_rgba(1,25,54,0.4)] backdrop-blur-xl">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-3 rounded-full bg-naples-yellow-900 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.35em] text-oxford-blue-400">
            Tasks
          </div>
          <h2 className="text-3xl text-oxford-blue-500">Plan with clarity and momentum</h2>
          <p className="type-subtle text-sm text-charcoal-500/85">
            Structure your day with elegant boards that balance priorities and progress.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="inline-flex rounded-xl border border-tea-green-700 bg-white/85 p-1 text-xs">
            <button
              onClick={() => setViewMode("grid")}
              className={`rounded-lg px-3 py-1 font-semibold ${
                viewMode === "grid" ? "bg-naples-yellow-900 text-oxford-blue-500" : "text-oxford-blue-400"
              }`}
            >
              Cards
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`rounded-lg px-3 py-1 font-semibold ${
                viewMode === "list" ? "bg-naples-yellow-900 text-oxford-blue-500" : "text-oxford-blue-400"
              }`}
            >
              List
            </button>
          </div>
          <button
            onClick={() => {
              setIsCreating(true);
              setFormErrors({});
            }}
            className="rounded-2xl bg-gradient-to-r from-red-crayola-500 via-naples-yellow-400 to-tea-green-400 px-6 py-3 text-sm font-semibold text-oxford-blue-500 shadow-[0_18px_36px_-20px_rgba(1,25,54,0.35)] transition-transform duration-300 hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-red-crayola-200"
          >
            Add task
          </button>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {(["all", "pending", "completed"] as const).map((filterType) => (
          <button
            key={filterType}
            onClick={() => setFilter(filterType)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-crayola-200 ${
              filter === filterType
                ? "bg-red-crayola-500 text-white shadow-[0_15px_30px_-20px_rgba(237,37,78,0.35)]"
                : "border border-tea-green-700 bg-white/80 text-oxford-blue-400 hover:border-red-crayola-400 hover:text-red-crayola-500"
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
          className="mb-6 rounded-2xl border border-tea-green-700 bg-white/90 p-6 shadow-[0_20px_45px_-30px_rgba(1,25,54,0.35)]"
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-semibold text-oxford-blue-500" htmlFor="task-title">
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
                className={`w-full rounded-xl border px-4 py-3 text-sm text-oxford-blue-500 placeholder:text-charcoal-400 focus:outline-none focus:ring-2 ${
                  formErrors.title
                    ? "border-red-crayola-400 bg-red-crayola-900 focus:ring-red-crayola-200"
                    : "border-tea-green-700 bg-white/85 focus:border-red-crayola-400 focus:ring-red-crayola-200"
                }`}
              />
              {formErrors.title && (
                <p className="mt-1 text-sm text-red-crayola-500">{formErrors.title}</p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-oxford-blue-500" htmlFor="task-priority">
                Priority
              </label>
              <select
                id="task-priority"
                value={newTask.priority}
                onChange={(e) =>
                  setNewTask((prev) => ({ ...prev, priority: e.target.value as Task["priority"] }))
                }
                className="w-full rounded-xl border border-tea-green-700 bg-white/85 px-4 py-3 text-sm text-oxford-blue-500 focus:border-red-crayola-400 focus:outline-none focus:ring-2 focus:ring-red-crayola-200"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-oxford-blue-500" htmlFor="task-due-date">
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
                className={`w-full rounded-xl border px-4 py-3 text-sm text-oxford-blue-500 focus:outline-none focus:ring-2 ${
                  formErrors.dueDate
                    ? "border-red-crayola-400 bg-red-crayola-900 focus:ring-red-crayola-200"
                    : "border-tea-green-700 bg-white/85 focus:border-red-crayola-400 focus:ring-red-crayola-200"
                }`}
              />
              {formErrors.dueDate && (
                <p className="mt-1 text-sm text-red-crayola-500">{formErrors.dueDate}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-semibold text-oxford-blue-500" htmlFor="task-description">
                Description
              </label>
              <textarea
                id="task-description"
                placeholder="Outline the steps or notes for this task"
                value={newTask.description}
                onChange={(e) =>
                  setNewTask((prev) => ({ ...prev, description: e.target.value }))
                }
                className="h-32 w-full resize-none rounded-xl border border-tea-green-700 bg-white/85 px-4 py-3 text-sm text-oxford-blue-500 placeholder:text-charcoal-400 focus:border-red-crayola-400 focus:outline-none focus:ring-2 focus:ring-red-crayola-200"
              />
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={editingTask ? handleUpdate : handleCreate}
              className="rounded-xl bg-red-crayola-500 px-5 py-2 text-sm font-semibold text-white shadow-[0_18px_35px_-22px_rgba(237,37,78,0.35)] transition-transform duration-200 hover:-translate-y-0.5 hover:bg-red-crayola-600"
            >
              {editingTask ? "Update task" : "Create task"}
            </button>
            <button
              onClick={resetForm}
              className="rounded-xl border border-tea-green-700 bg-white/85 px-5 py-2 text-sm font-semibold text-oxford-blue-400 transition-colors hover:border-red-crayola-400 hover:text-red-crayola-500"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {viewMode === "grid" && (
      <div className="grid max-h-[420px] grid-cols-1 gap-4 overflow-y-auto pr-1 md:grid-cols-2">
        {filteredTasks.map((task) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="group rounded-2xl border border-tea-green-700 bg-white/90 p-5 shadow-sm shadow-charcoal-900/20 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_20px_35px_-30px_rgba(1,25,54,0.35)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <p className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${getPriorityBadge(task.priority)}`}>
                  <span className="h-2 w-2 rounded-full bg-white/80" />
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} priority
                </p>
                <h3 className="text-lg font-semibold text-oxford-blue-500">{task.title}</h3>
                {task.description && (
                  <p className="type-subtle text-sm text-charcoal-500/90">{task.description}</p>
                )}
              </div>
              <div className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadge(task.status)}`}>
                {task.status === "completed" ? "Completed" : "In progress"}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-charcoal-400">
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
                className="rounded-xl border border-tea-green-700 bg-white/85 px-4 py-2 text-xs font-semibold text-oxford-blue-400 transition-colors hover:border-red-crayola-400 hover:text-red-crayola-500"
              >
                Mark as {task.status === "completed" ? "pending" : "completed"}
              </button>
              <button
                onClick={() => startEdit(task)}
                className="rounded-xl border border-tea-green-700 bg-white/85 px-4 py-2 text-xs font-semibold text-oxford-blue-400 transition-colors hover:border-red-crayola-400 hover:text-red-crayola-500"
              >
                Edit
              </button>
              <button
                onClick={() => setTaskToDelete(task)}
                className="rounded-xl border border-transparent bg-naples-yellow-900 px-4 py-2 text-xs font-semibold text-oxford-blue-500 transition-colors hover:bg-naples-yellow-800"
              >
                Delete
              </button>
            </div>
          </motion.div>
        ))}

        {filteredTasks.length === 0 && (
          <div className="col-span-full flex h-48 items-center justify-center rounded-2xl border border-dashed border-tea-green-700 text-center text-charcoal-400">
            {filter === "all"
              ? "No tasks yet. Create your first plan."
              : "Nothing matches this filter right now."}
          </div>
        )}
      </div>
      )}

      {viewMode === "list" && (
        <div className="max-h-[420px] overflow-y-auto pr-1">
          <div className="divide-y divide-tea-green-700 rounded-2xl border border-tea-green-700 bg-white/90">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:gap-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                    <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
                      <span className={`inline-flex items-center gap-2 rounded-full px-2 py-0.5 text-[10px] font-semibold ${getPriorityBadge(task.priority)}`}>
                        <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
                        {task.priority}
                      </span>
                      <h3 className="truncate text-sm font-semibold text-oxford-blue-500">{task.title}</h3>
                    </div>
                    <div
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${getStatusBadge(task.status)} text-left sm:text-right`}
                    >
                      {task.status === "completed" ? "Completed" : "In progress"}
                    </div>
                  </div>
                  {task.description && (
                    <p className="type-subtle mt-1 line-clamp-1 text-xs text-charcoal-500/90">{task.description}</p>
                  )}
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-charcoal-400">
                    <span>Updated {new Date(task.updatedAt ?? task.createdAt).toLocaleDateString()}</span>
                    {task.dueDate && <span>• Due {new Date(task.dueDate).toLocaleDateString()}</span>}
                  </div>
                </div>
                <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:flex-nowrap sm:items-center sm:justify-end">
                  <button
                    onClick={() => updateStatus(task, task.status === "completed" ? "pending" : "completed")}
                    className="flex-1 rounded-lg border border-tea-green-700 px-3 py-1 text-xs font-semibold text-oxford-blue-400 transition-colors hover:border-red-crayola-400 hover:text-red-crayola-500 sm:flex-none"
                  >
                    {task.status === "completed" ? "Mark pending" : "Mark completed"}
                  </button>
                  <button
                    onClick={() => startEdit(task)}
                    className="flex-1 rounded-lg border border-tea-green-700 px-3 py-1 text-xs font-semibold text-oxford-blue-400 transition-colors hover:border-red-crayola-400 hover:text-red-crayola-500 sm:flex-none"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setTaskToDelete(task)}
                    className="flex-1 rounded-lg bg-naples-yellow-900 px-3 py-1 text-xs font-semibold text-oxford-blue-500 transition-colors hover:bg-naples-yellow-800 sm:flex-none"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {filteredTasks.length === 0 && (
              <div className="flex h-36 items-center justify-center text-charcoal-400">
                {filter === "all" ? "No tasks yet. Create your first plan." : "Nothing matches this filter right now."}
              </div>
            )}
          </div>
        </div>
      )}

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

