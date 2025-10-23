"use client";

import { Note, useNotes } from "@/hooks/useNotes";
import { useState } from "react";
import { motion } from "framer-motion";
import AlertDialog from "./AlertDialog";
import ConfirmDialog from "./ConfirmDialog";

type NotesProps = {
  userId?: string;
  onBackToDashboard: () => void;
};

type NoteErrors = {
  title?: string;
  content?: string;
};

const Notes = ({ userId, onBackToDashboard }: NotesProps) => {
  const { notes, createNote, updateNote, deleteNote } = useNotes(userId);
  const [isCreating, setIsCreating] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [newNote, setNewNote] = useState({ title: "", content: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [alertMsg, setAlertMsg] = useState<string | null>(null);
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);
  const [formErrors, setFormErrors] = useState<NoteErrors>({});

  const resetForm = () => {
    setNewNote({ title: "", content: "" });
    setEditingNote(null);
    setIsCreating(false);
    setFormErrors({});
  };

  const validateForm = () => {
    const errors: NoteErrors = {};
    if (!newNote.title.trim()) {
      errors.title = "A darling title is required.";
    }
    if (!newNote.content.trim()) {
      errors.content = "Don&apos;t forget to add your note content.";
    }
    setFormErrors(errors);
    return errors;
  };

  const handleCreate = () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setAlertMsg("Please fix the highlighted note fields before saving.");
      return;
    }

    createNote(newNote.title.trim(), newNote.content.trim());
    resetForm();
  };

  const handleUpdate = () => {
    if (!editingNote) return;
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setAlertMsg("Please fix the highlighted note fields before updating.");
      return;
    }

    updateNote(editingNote.id, {
      title: newNote.title.trim(),
      content: newNote.content.trim(),
    });
    resetForm();
  };

  const startEdit = (note: Note) => {
    setEditingNote(note);
    setNewNote({ title: note.title, content: note.content });
    setFormErrors({});
    setIsCreating(true);
  };

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="glass-card rounded-3xl border border-rose-200/60 p-6 shadow-lg shadow-rose-100">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-3 text-3xl font-bold text-rose-600">
            <span className="text-4xl">📝</span>
            Notes
          </h2>
          <p className="text-sm text-rose-500">Capture your thoughts in gorgeous detail.</p>
        </div>
        <button
          onClick={() => {
            setIsCreating(true);
            setFormErrors({});
          }}
          className="rounded-2xl bg-gradient-to-r from-rose-400 via-pink-300 to-amber-300 px-5 py-2 text-sm font-semibold text-rose-900 shadow-md shadow-rose-200 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-rose-200"
        >
          + New Note
        </button>
      </div>

      <div className="mb-5">
        <label className="sr-only" htmlFor="note-search">
          Search notes
        </label>
        <input
          id="note-search"
          type="text"
          placeholder="Search notes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-2xl border border-rose-200/70 bg-white/80 px-4 py-3 text-rose-700 placeholder:text-rose-300 shadow-inner focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-200"
        />
      </div>

      {isCreating && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-2xl border border-rose-200/70 bg-white/85 p-5 shadow-md"
        >
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-semibold text-rose-500" htmlFor="note-title">
                Title
              </label>
              <input
                id="note-title"
                type="text"
                placeholder="Note title..."
                value={newNote.title}
                onChange={(e) => {
                  const value = e.target.value;
                  setNewNote((prev) => ({ ...prev, title: value }));
                  if (formErrors.title && value.trim()) {
                    setFormErrors((prev) => ({ ...prev, title: undefined }));
                  }
                }}
                className={`w-full rounded-xl border px-4 py-3 text-rose-700 placeholder:text-rose-300 focus:outline-none focus:ring-2 ${
                  formErrors.title
                    ? "border-rose-400 bg-rose-50 focus:ring-rose-300"
                    : "border-rose-200 bg-white/70 focus:border-rose-300 focus:ring-rose-200"
                }`}
              />
              {formErrors.title && (
                <p className="mt-1 text-sm text-rose-500">{formErrors.title}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-rose-500" htmlFor="note-content">
                Content
              </label>
              <textarea
                id="note-content"
                placeholder="Write your note..."
                value={newNote.content}
                onChange={(e) => {
                  const value = e.target.value;
                  setNewNote((prev) => ({ ...prev, content: value }));
                  if (formErrors.content && value.trim()) {
                    setFormErrors((prev) => ({ ...prev, content: undefined }));
                  }
                }}
                className={`h-32 w-full resize-none rounded-xl border px-4 py-3 text-rose-700 placeholder:text-rose-300 focus:outline-none focus:ring-2 ${
                  formErrors.content
                    ? "border-rose-400 bg-rose-50 focus:ring-rose-300"
                    : "border-rose-200 bg-white/70 focus:border-rose-300 focus:ring-rose-200"
                }`}
              />
              {formErrors.content && (
                <p className="mt-1 text-sm text-rose-500">{formErrors.content}</p>
              )}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={editingNote ? handleUpdate : handleCreate}
              className="rounded-xl bg-gradient-to-r from-rose-400 via-pink-400 to-amber-300 px-4 py-2 text-sm font-semibold text-rose-900 shadow-md shadow-rose-200 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-rose-200"
            >
              {editingNote ? "Update" : "Create"}
            </button>
            <button
              onClick={resetForm}
              className="rounded-xl border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-400 transition-colors hover:border-rose-300 hover:text-rose-500"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      <div className="max-h-96 space-y-3 overflow-y-auto pr-1">
        {filteredNotes.map((note) => (
          <motion.div
            key={note.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-rose-200/70 bg-white/80 p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-rose-300 hover:shadow-md"
          >
            <div className="mb-2 flex items-start justify-between gap-4">
              <h3 className="text-lg font-semibold text-rose-600">{note.title}</h3>
              <div className="flex gap-2 text-lg">
                <button
                  onClick={() => startEdit(note)}
                  className="rounded-full bg-rose-100 px-2 py-1 text-rose-500 transition-colors hover:bg-rose-200"
                  aria-label="Edit note"
                >
                  ✏️
                </button>
                <button
                  onClick={() => setNoteToDelete(note)}
                  className="rounded-full bg-rose-100 px-2 py-1 text-rose-500 transition-colors hover:bg-rose-200"
                  aria-label="Delete note"
                >
                  🗑️
                </button>
              </div>
            </div>
            <p className="mb-4 whitespace-pre-wrap text-sm leading-relaxed text-rose-500">
              {note.content}
            </p>
            <div className="flex flex-wrap items-center justify-between text-xs text-rose-300">
              <span>Created: {new Date(note.createdAt).toLocaleDateString()}</span>
              <span>Updated: {new Date(note.updatedAt).toLocaleDateString()}</span>
            </div>
          </motion.div>
        ))}

        {filteredNotes.length === 0 && (
          <div className="py-10 text-center text-rose-400">
            {searchTerm
              ? "No notes found matching your search."
              : "No notes yet. Create your first note!"}
          </div>
        )}
      </div>

      <div className="mt-6">
        <button
          onClick={onBackToDashboard}
          className="text-sm font-semibold text-rose-500 transition-colors hover:text-rose-600"
        >
          ← Back to dashboard
        </button>
      </div>

      <ConfirmDialog
        isOpen={!!noteToDelete}
        title="Delete Note"
        message="Are you sure you want to delete this note? This action cannot be undone."
        onConfirm={() => {
          if (noteToDelete) {
            deleteNote(noteToDelete.id);
            setNoteToDelete(null);
          }
        }}
        onCancel={() => setNoteToDelete(null)}
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

export default Notes;
