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

  useEffect(() => {
    if (userId) {
      fetch(`/api/notes`)
        .then((res) => res.json())
        .then((data) => setNotes(data))
        .catch(console.error);
    }
  }, [userId]);

  const createNote = async (title: string, content: string) => {
    const res = await fetch(`/api/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    });
    const newNote = await res.json();
    setNotes((prev) => [...prev, newNote]);
  };

  const updateNote = async (id: string, updatedFields: Partial<Note>) => {
    const res = await fetch(`/api/notes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedFields),
    });
    const updatedNote = await res.json();
    setNotes((prev) =>
      prev.map((note) => (note.id === id ? updatedNote : note))
    );
  };

  const deleteNote = async (id: string) => {
    await fetch(`/api/notes/${id}`, { method: "DELETE" });
    setNotes((prev) => prev.filter((note) => note.id !== id));
  };

  return { notes, createNote, updateNote, deleteNote };
}
