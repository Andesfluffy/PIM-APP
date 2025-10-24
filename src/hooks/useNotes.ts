// "use client";

// import { useState, useEffect } from "react";

// export interface Note {
//   id: string;
//   title: string;
//   content: string;
//   createdAt: Date;
//   updatedAt: Date;
//   userId: string;
// }

// export function useNotes(userId: string | undefined) {
//   const [notes, setNotes] = useState<Note[]>([]);

//   useEffect(() => {
//     if (userId) {
//       const savedNotes = localStorage.getItem(`notes_${userId}`);
//       if (savedNotes) {
//         const parsedNotes = JSON.parse(savedNotes).map((note: any) => ({
//           ...note,
//           createdAt: new Date(note.createdAt),
//           updatedAt: new Date(note.updatedAt),
//         }));
//         setNotes(parsedNotes);
//       }
//     }
//   }, [userId]);

//   const saveNotes = (newNotes: Note[]) => {
//     if (userId) {
//       setNotes(newNotes);
//       localStorage.setItem(`notes_${userId}`, JSON.stringify(newNotes));
//     }
//   };

//   const createNote = (title: string, content: string) => {
//     if (!userId) return;
//     const newNote: Note = {
//       id: `note_${Date.now()}`,
//       title,
//       content,
//       createdAt: new Date(),
//       updatedAt: new Date(),
//       userId,
//     };
//     const updatedNotes = [newNote, ...notes];
//     saveNotes(updatedNotes);
//   };

//   const updateNote = (id: string, title: string, content: string) => {
//     const updatedNotes = notes.map((note) =>
//       note.id === id ? { ...note, title, content, updatedAt: new Date() } : note
//     );
//     saveNotes(updatedNotes);
//   };

//   const deleteNote = (id: string) => {
//     const updatedNotes = notes.filter((note) => note.id !== id);
//     saveNotes(updatedNotes);
//   };

//   return { notes, createNote, updateNote, deleteNote };
// }

"use client";

import { useEffect, useState } from "react";

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export function useNotes(userId: string | undefined) {
  const [notes, setNotes] = useState<Note[]>([]);

  // Fetch from backend
  useEffect(() => {
    if (userId) {
      fetch(`/api/notes`)
        .then(async (res) => {
          if (!res.ok) {
            if (res.status === 401) return [] as any[];
            throw new Error(`HTTP ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          const list = Array.isArray(data) ? data : [];
          setNotes(
            list.map((n: any) => ({
              id: n._id,
              ...n,
            }))
          );
        })
        .catch((err) => {
          if (String(err?.message || "").includes("401")) {
            setNotes([]);
            return;
          }
          console.error("GET /api/notes failed", err);
          setNotes([]);
        });
    }
  }, [userId]);

  // Light revalidation on window focus
  useEffect(() => {
    if (!userId) return;
    const onFocus = () => {
      fetch(`/api/notes`)
        .then(async (res) => {
          if (!res.ok) {
            if (res.status === 401) return [] as any[];
            throw new Error(`HTTP ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          const list = Array.isArray(data) ? data : [];
          setNotes(
            list.map((n: any) => ({
              id: n._id,
              ...n,
            }))
          );
        })
        .catch(() => {});
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [userId]);

  const createNote = async (title: string, content: string) => {
    const nowIso = new Date().toISOString();
    const tempId = `temp_${Date.now()}`;
    const tempNote: Note = {
      id: tempId,
      title,
      content,
      createdAt: nowIso,
      updatedAt: nowIso,
      userId: userId || "",
    };

    // Optimistically add to the top
    setNotes((prev) => [tempNote, ...prev]);

    try {
      const res = await fetch(`/api/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });
      if (!res.ok) throw new Error(`Failed to create note: ${res.status}`);
      const newNote = await res.json();
      setNotes((prev) =>
        prev.map((n) =>
          n.id === tempId
            ? {
                id: newNote._id,
                ...newNote,
              }
            : n
        )
      );
    } catch (err) {
      console.error(err);
      // Revert optimistic insert on failure
      setNotes((prev) => prev.filter((n) => n.id !== tempId));
    }
  };

  const updateNote = async (id: string, updatedFields: Partial<Note>) => {
    // Optimistic update
    const prevNotes = notes.slice();
    setNotes((prev) =>
      prev.map((note) =>
        note.id === id ? { ...note, ...updatedFields, updatedAt: new Date().toISOString() } : note
      )
    );

    try {
      const res = await fetch(`/api/notes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedFields),
      });
      if (!res.ok) throw new Error(`Failed to update note: ${res.status}`);
      const updatedNote = await res.json();
      setNotes((prev) =>
        prev.map((note) =>
          note.id === id ? { id: updatedNote._id, ...updatedNote } : note
        )
      );
    } catch (err) {
      console.error(err);
      // Revert on failure
      setNotes(prevNotes);
    }
  };

  const deleteNote = async (id: string) => {
    await fetch(`/api/notes/${id}`, { method: "DELETE" });
    setNotes((prev) => prev.filter((note) => note.id !== id));
  };

  return { notes, createNote, updateNote, deleteNote };
}
