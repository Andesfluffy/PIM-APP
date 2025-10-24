// "use client";

// import { useEffect, useState } from "react";

// export interface Task {
//   id: string;
//   title: string;
//   description: string;
//   status: "pending" | "completed";
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
  status: "pending" | "completed";
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
      fetch(`/api/tasks`)
        .then(async (res) => {
          if (!res.ok) {
            if (res.status === 401) return [] as any[];
            throw new Error(`HTTP ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          const list = Array.isArray(data) ? data : [];
          setTasks(
            list.map((t: any) => ({
              id: t._id,
              ...t,
            }))
          );
        })
        .catch((err) => {
          if (String(err?.message || "").includes("401")) {
            setTasks([]);
            return;
          }
          console.error("GET /api/tasks failed", err);
          setTasks([]);
        });
    }
  }, [userId]);

  // Light revalidation on window focus
  useEffect(() => {
    if (!userId) return;
    const onFocus = () => {
      fetch(`/api/tasks`)
        .then(async (res) => {
          if (!res.ok) {
            if (res.status === 401) return [] as any[];
            throw new Error(`HTTP ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          const list = Array.isArray(data) ? data : [];
          setTasks(
            list.map((t: any) => ({
              id: t._id,
              ...t,
            }))
          );
        })
        .catch(() => {});
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [userId]);

  const createTask = async (
    task: Omit<Task, "id" | "createdAt" | "updatedAt">
  ) => {
    const nowIso = new Date().toISOString();
    const tempId = `temp_${Date.now()}`;
    const tempTask: Task = {
      id: tempId,
      title: task.title,
      description: task.description || "",
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
      createdAt: nowIso,
      updatedAt: nowIso,
      userId: userId || "",
    };

    // Optimistically add to the top
    setTasks((prev) => [tempTask, ...prev]);

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          dueDate: task.dueDate,
        }),
      });
      if (!res.ok) throw new Error(`Failed to create task: ${res.status}`);
      const newTask = await res.json();
      setTasks((prev) =>
        prev.map((t) => (t.id === tempId ? { id: newTask._id, ...newTask } : t))
      );
    } catch (err) {
      console.error(err);
      // Revert optimistic insert
      setTasks((prev) => prev.filter((t) => t.id !== tempId));
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    // Optimistic update for snappy UX (e.g., mark as completed)
    const prevTasks = tasks.slice();
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t))
    );

    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error(`Failed to update task: ${res.status}`);
      const updated = await res.json();
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { id: updated._id, ...updated } : t))
      );
    } catch (err) {
      console.error(err);
      // Revert on failure
      setTasks(prevTasks);
    }
  };

  const deleteTask = async (id: string) => {
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  return { tasks, createTask, updateTask, deleteTask };
}
