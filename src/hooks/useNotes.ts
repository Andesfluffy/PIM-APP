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
      fetch(`/api/notes?userId=${userId}`)
        .then((res) => res.json())
        .then((data) =>
          setNotes(
            data.map((n: any) => ({
              id: n._id,
              ...n,
            }))
          )
        )
        .catch(console.error);
    }
  }, [userId]);

  const createNote = async (title: string, content: string) => {
    const res = await fetch(`/api/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, userId }),
    });
    if (!res.ok) {
      console.error(`Failed to create note: ${res.status}`);
      return;
    }
    const newNote = await res.json();
    setNotes((prev) => [
      ...prev,
      {
        id: newNote._id,
        ...newNote,
      },
    ]);
  };

  const updateNote = async (id: string, updatedFields: Partial<Note>) => {
    const res = await fetch(`/api/notes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedFields),
    });
    const updatedNote = await res.json();
    setNotes((prev) =>
      prev.map((note) =>
        note.id === id ? { id: updatedNote._id, ...updatedNote } : note
      )
    );
  };

  const deleteNote = async (id: string) => {
    await fetch(`/api/notes/${id}`, { method: "DELETE" });
    setNotes((prev) => prev.filter((note) => note.id !== id));
  };

  return { notes, createNote, updateNote, deleteNote };
}
