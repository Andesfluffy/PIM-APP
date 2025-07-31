// "use client";

// import { useEffect, useState } from "react";

// export interface Task {
//   id: string;
//   title: string;
//   description: string;
//   status: "pending" | "in-progress" | "completed";
//   priority: "low" | "medium" | "high";
//   dueDate?: Date;
//   createdAt: Date;
//   updatedAt: Date;
//   userId: string;
// }

// export function useTasks(userId: string | undefined) {
//   const [tasks, setTasks] = useState<Task[]>([]);

//   useEffect(() => {
//     if (userId) {
//       const savedTasks = localStorage.getItem(`tasks_${userId}`);
//       if (savedTasks) {
//         const parsedTasks = JSON.parse(savedTasks).map((task: any) => ({
//           ...task,
//           createdAt: new Date(task.createdAt),
//           updatedAt: new Date(task.updatedAt),
//           dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
//         }));
//         setTasks(parsedTasks);
//       }
//     }
//   }, [userId]);

//   const saveTasks = (newTasks: Task[]) => {
//     if (userId) {
//       setTasks(newTasks);
//       localStorage.setItem(`tasks_${userId}`, JSON.stringify(newTasks));
//     }
//   };

//   const createTask = (
//     title: string,
//     description: string,
//     priority: Task["priority"],
//     dueDate?: Date
//   ) => {
//     if (!userId) return;
//     const newTask: Task = {
//       id: `task_${Date.now()}`,
//       title,
//       description,
//       status: "pending",
//       priority,
//       dueDate,
//       createdAt: new Date(),
//       updatedAt: new Date(),
//       userId,
//     };
//     const updatedTasks = [newTask, ...tasks];
//     saveTasks(updatedTasks);
//   };

//   const updateTask = (id: string, updates: Partial<Task>) => {
//     const updatedTasks = tasks.map((task) =>
//       task.id === id ? { ...task, ...updates, updatedAt: new Date() } : task
//     );
//     saveTasks(updatedTasks);
//   };

//   const deleteTask = (id: string) => {
//     const updatedTasks = tasks.filter((task) => task.id !== id);
//     saveTasks(updatedTasks);
//   };

//   return { tasks, createTask, updateTask, deleteTask };
// }

"use client";

import { useEffect, useState } from "react";

export interface Task {
  id: string;
  title: string;
  description: string;
  status: "pending" | "in-progress" | "completed";
  priority: "low" | "medium" | "high";
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export function useTasks(userId: string | undefined) {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (userId) {
      fetch(`/api/tasks?userId=${userId}`)
        .then((res) => res.json())
        .then(setTasks)
        .catch(console.error);
    }
  }, [userId]);

  const createTask = async (
    task: Omit<Task, "id" | "createdAt" | "updatedAt">
  ) => {
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(task),
    });
    if (!res.ok) {
      console.error(`Failed to create task: ${res.status}`);
      return;
    }
    const newTask = await res.json();
    setTasks((prev) => [...prev, newTask]);
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    const res = await fetch(`/api/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    const updated = await res.json();
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
  };

  const deleteTask = async (id: string) => {
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  return { tasks, createTask, updateTask, deleteTask };
}
