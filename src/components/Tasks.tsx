"use client";

import { Task, useTasks } from "@/hooks/useTasks";
import { useState } from "react";
import { motion } from "framer-motion";

type TasksProps = {
  userId?: string;
  onBackToDashboard: () => void;
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
  const [filter, setFilter] = useState<
    "all" | "pending" | "in-progress" | "completed"
  >("all");

  const handleCreate = () => {
    if (newTask.title.trim()) {
      createTask({
        title: newTask.title,
        description: newTask.description,
        priority: newTask.priority,
        dueDate: newTask.dueDate
          ? new Date(newTask.dueDate).toISOString()
          : undefined,
        status: "pending",
        userId,
      });

      setNewTask({
        title: "",
        description: "",
        priority: "medium",
        dueDate: "",
      });
      setIsCreating(false);
    }
  };

  const handleUpdate = () => {
    if (editingTask && newTask.title.trim()) {
      updateTask(editingTask.id, {
        title: newTask.title,
        description: newTask.description,
        priority: newTask.priority,
        dueDate: newTask.dueDate
          ? new Date(newTask.dueDate).toISOString()
          : undefined,
      });

      setEditingTask(null);
      setNewTask({
        title: "",
        description: "",
        priority: "medium",
        dueDate: "",
      });
      setIsCreating(false);
    }
  };

  const startEdit = (task: Task) => {
    setEditingTask(task);
    setNewTask({
      title: task.title,
      description: task.description,
      priority: task.priority,
      dueDate: task.dueDate
        ? new Date(task.dueDate).toISOString().split("T")[0]
        : "",
    });
    setIsCreating(true);
  };

  const toggleStatus = (task: Task) => {
    const statusOrder: Task["status"][] = [
      "pending",
      "in-progress",
      "completed",
    ];
    const currentIndex = statusOrder.indexOf(task.status);
    const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
    updateTask(task.id, { status: nextStatus });
  };

  const filteredTasks = tasks.filter((task) =>
    filter === "all" ? true : task.status === filter
  );

  const getStatusColor = (status: Task["status"]) => {
    switch (status) {
      case "pending":
        return "text-yellow-400 bg-yellow-600/20";
      case "in-progress":
        return "text-blue-400 bg-blue-600/20";
      case "completed":
        return "text-green-400 bg-green-600/20";
    }
  };

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "high":
        return "text-red-400 bg-red-600/20";
      case "medium":
        return "text-yellow-400 bg-yellow-600/20";
      case "low":
        return "text-green-400 bg-green-600/20";
    }
  };

  return (
    <div className="glass-card p-6 rounded-2xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-white flex items-center gap-3">
          <span className="text-4xl">✅</span>
          Tasks
        </h2>
        <button
          onClick={() => setIsCreating(true)}
          className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105"
        >
          + New Task
        </button>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {(["all", "pending", "in-progress", "completed"] as const).map(
          (filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                filter === filterType
                  ? "bg-indigo-600 text-white"
                  : "bg-white/10 text-white/70 hover:bg-white/20"
              }`}
            >
              {filterType.charAt(0).toUpperCase() +
                filterType.slice(1).replace("-", " ")}
            </button>
          )
        )}
      </div>

      {isCreating && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 p-4 rounded-xl border border-white/20 mb-4"
        >
          <input
            type="text"
            placeholder="Task title..."
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            className="w-full bg-transparent border-none text-white text-lg font-semibold placeholder-white/50 focus:outline-none mb-2"
          />
          <textarea
            placeholder="Task description..."
            value={newTask.description}
            onChange={(e) =>
              setNewTask({ ...newTask, description: e.target.value })
            }
            className="w-full bg-transparent border-none text-white placeholder-white/50 focus:outline-none resize-none h-20 mb-3"
          />
          <div className="flex gap-4 mb-3 flex-wrap">
            <select
              value={newTask.priority}
              onChange={(e) =>
                setNewTask({
                  ...newTask,
                  priority: e.target.value as Task["priority"],
                })
              }
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-white text-sm"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
            <input
              type="date"
              value={newTask.dueDate}
              onChange={(e) =>
                setNewTask({ ...newTask, dueDate: e.target.value })
              }
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-white text-sm"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={editingTask ? handleUpdate : handleCreate}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded-lg text-sm font-medium"
            >
              {editingTask ? "Update" : "Create"}
            </button>
            <button
              onClick={() => {
                setIsCreating(false);
                setEditingTask(null);
                setNewTask({
                  title: "",
                  description: "",
                  priority: "medium",
                  dueDate: "",
                });
              }}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-1 rounded-lg text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredTasks.map((task) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/10 p-4 rounded-xl border border-white/20 hover:border-white/30 transition-colors group"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-white font-semibold text-lg">{task.title}</h3>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => startEdit(task)}
                  className="text-blue-400 hover:text-blue-300 text-sm"
                >
                  ✏️
                </button>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  🗑️
                </button>
              </div>
            </div>

            {task.description && (
              <p className="text-white/80 text-sm mb-3">{task.description}</p>
            )}

            <div className="flex justify-between items-center mb-2">
              <div className="flex gap-2">
                <button
                  onClick={() => toggleStatus(task)}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${getStatusColor(
                    task.status
                  )}`}
                >
                  {task.status.replace("-", " ")}
                </button>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(
                    task.priority
                  )}`}
                >
                  {task.priority} priority
                </span>
              </div>
              {task.dueDate && (
                <span className="text-white/50 text-xs">
                  Due: {new Date(task.dueDate).toLocaleDateString()}
                </span>
              )}
            </div>

            <div className="flex justify-between items-center text-xs text-white/50">
              <span>
                Created: {new Date(task.createdAt).toLocaleDateString()}
              </span>
              <span>
                Updated: {new Date(task.updatedAt).toLocaleDateString()}
              </span>
            </div>
          </motion.div>
        ))}

        {filteredTasks.length === 0 && (
          <div className="text-center text-white/50 py-8">
            {filter === "all"
              ? "No tasks yet. Create your first task!"
              : `No ${filter.replace("-", " ")} tasks.`}
          </div>
        )}
      </div>

      {/* ✅ Back Button */}
      <div className="mt-6">
        <button
          onClick={onBackToDashboard}
          className="text-purple-400 hover:text-purple-200 text-sm underline"
        >
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default Tasks;
