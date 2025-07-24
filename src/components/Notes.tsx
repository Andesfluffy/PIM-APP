"use client";

import { Note, useNotes } from "@/hooks/useNotes";
import { useState } from "react";
import { motion } from "framer-motion";

const Notes = () => {
  const { notes, createNote, updateNote, deleteNote } = useNotes("");
  const [isCreating, setIsCreating] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [newNote, setNewNote] = useState({ title: "", content: "" });
  const [searchTerm, setSearchTerm] = useState("");

  const handleCreate = () => {
    if (newNote.title.trim() && newNote.content.trim()) {
      createNote(newNote.title, newNote.content);
      setNewNote({ title: "", content: "" });
      setIsCreating(false);
    }
  };

  const handleUpdate = () => {
    if (editingNote && newNote.title.trim() && newNote.content.trim()) {
      updateNote(editingNote.id, newNote.title, newNote.content);
      setEditingNote(null);
      setNewNote({ title: "", content: "" });
    }
  };

  const startEdit = (note: Note) => {
    setEditingNote(note);
    setNewNote({ title: note.title, content: note.content });
    setIsCreating(true);
  };

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="glass-card p-6 rounded-2xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-white flex items-center gap-3">
          <span className="text-4xl">📝</span>
          Notes
        </h2>
        <button
          onClick={() => setIsCreating(true)}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105"
        >
          + New Note
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search notes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {isCreating && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 p-4 rounded-xl border border-white/20 mb-4"
        >
          <input
            type="text"
            placeholder="Note title..."
            value={newNote.title}
            onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
            className="w-full bg-transparent border-none text-white text-lg font-semibold placeholder-white/50 focus:outline-none mb-2"
          />
          <textarea
            placeholder="Write your note..."
            value={newNote.content}
            onChange={(e) =>
              setNewNote({ ...newNote, content: e.target.value })
            }
            className="w-full bg-transparent border-none text-white placeholder-white/50 focus:outline-none resize-none h-32 mb-3"
          />
          <div className="flex gap-2">
            <button
              onClick={editingNote ? handleUpdate : handleCreate}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded-lg text-sm font-medium"
            >
              {editingNote ? "Update" : "Create"}
            </button>
            <button
              onClick={() => {
                setIsCreating(false);
                setEditingNote(null);
                setNewNote({ title: "", content: "" });
              }}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-1 rounded-lg text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredNotes.map((note) => (
          <motion.div
            key={note.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/10 p-4 rounded-xl border border-white/20 hover:border-white/30 transition-colors group"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-white font-semibold text-lg">{note.title}</h3>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => startEdit(note)}
                  className="text-blue-400 hover:text-blue-300 text-sm"
                >
                  ✏️
                </button>
                <button
                  onClick={() => deleteNote(note.id)}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  🗑️
                </button>
              </div>
            </div>
            <p className="text-white/80 text-sm mb-3 whitespace-pre-wrap">
              {note.content}
            </p>
            <div className="flex justify-between items-center text-xs text-white/50">
              <span>Created: {note.createdAt.toLocaleDateString()}</span>
              <span>Updated: {note.updatedAt.toLocaleDateString()}</span>
            </div>
          </motion.div>
        ))}

        {filteredNotes.length === 0 && (
          <div className="text-center text-white/50 py-8">
            {searchTerm
              ? "No notes found matching your search."
              : "No notes yet. Create your first note!"}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notes;
