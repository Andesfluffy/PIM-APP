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
      errors.title = "Please provide a note title.";
    }
    if (!newNote.content.trim()) {
      errors.content = "Note content cannot be empty.";
    }
    setFormErrors(errors);
    return errors;
  };

  const handleCreate = () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setAlertMsg("Resolve the highlighted fields before saving the note.");
      return;
    }

    createNote(newNote.title.trim(), newNote.content.trim());
    resetForm();
  };

  const handleUpdate = () => {
    if (!editingNote) return;
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setAlertMsg("Resolve the highlighted fields before updating the note.");
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
    <div className="rounded-[32px] border border-emerald-100/70 bg-white/80 p-8 shadow-[0_40px_80px_-55px_rgba(12,74,48,0.6)] backdrop-blur-xl">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-3 rounded-full bg-emerald-100/80 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.35em] text-emerald-500">
            Notes
          </div>
          <h2 className="text-3xl text-emerald-800">Curate your ideas with polish</h2>
          <p className="type-subtle text-sm text-emerald-600/80">
            Layer thoughts, outlines, and inspiration in a tranquil grid designed for focus.
          </p>
        </div>
        <button
          onClick={() => {
            setIsCreating(true);
            setFormErrors({});
          }}
          className="rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-lime-300 px-6 py-3 text-sm font-semibold text-emerald-900 shadow-[0_18px_36px_-20px_rgba(16,94,67,0.45)] transition-transform duration-300 hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-emerald-200"
        >
          Add note
        </button>
      </div>

      <div className="mb-6">
        <label className="sr-only" htmlFor="note-search">
          Search notes
        </label>
        <div className="relative">
          <input
            id="note-search"
            type="text"
            placeholder="Search notes by title or keyword"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-2xl border border-emerald-100/70 bg-white/70 px-5 py-3 text-sm text-emerald-700 shadow-inner shadow-emerald-50 placeholder:text-emerald-200 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          />
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-emerald-200">🔍</span>
        </div>
      </div>

      {isCreating && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-2xl border border-emerald-100/70 bg-white/85 p-6 shadow-[0_20px_45px_-30px_rgba(12,74,48,0.45)]"
        >
          <div className="grid grid-cols-1 gap-5">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-emerald-600" htmlFor="note-title">
                Title
              </label>
              <input
                id="note-title"
                type="text"
                placeholder="Give your note a title"
                value={newNote.title}
                onChange={(e) => {
                  const value = e.target.value;
                  setNewNote((prev) => ({ ...prev, title: value }));
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
              <label className="mb-1.5 block text-sm font-semibold text-emerald-600" htmlFor="note-content">
                Content
              </label>
              <textarea
                id="note-content"
                placeholder="Capture the details here"
                value={newNote.content}
                onChange={(e) => {
                  const value = e.target.value;
                  setNewNote((prev) => ({ ...prev, content: value }));
                  if (formErrors.content && value.trim()) {
                    setFormErrors((prev) => ({ ...prev, content: undefined }));
                  }
                }}
                className={`h-36 w-full resize-none rounded-xl border px-4 py-3 text-sm text-emerald-700 placeholder:text-emerald-200 focus:outline-none focus:ring-2 ${
                  formErrors.content
                    ? "border-emerald-400 bg-emerald-50 focus:ring-emerald-300"
                    : "border-emerald-100 bg-white/80 focus:border-emerald-300 focus:ring-emerald-200"
                }`}
              />
              {formErrors.content && (
                <p className="mt-1 text-sm text-emerald-600">{formErrors.content}</p>
              )}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={editingNote ? handleUpdate : handleCreate}
              className="rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-[0_18px_35px_-22px_rgba(16,94,67,0.55)] transition-transform duration-200 hover:-translate-y-0.5 hover:bg-emerald-700"
            >
              {editingNote ? "Update note" : "Create note"}
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

      <div className="grid max-h-[420px] grid-cols-1 gap-4 overflow-y-auto pr-1 md:grid-cols-2 xl:grid-cols-3">
        {filteredNotes.map((note) => (
          <motion.div
            key={note.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="group rounded-2xl border border-emerald-100/70 bg-white/85 p-5 shadow-sm shadow-emerald-50 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_20px_35px_-30px_rgba(12,74,48,0.55)]"
          >
            <div className="mb-3 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-emerald-800">{note.title}</h3>
                <p className="type-subtle mt-1 text-xs uppercase tracking-[0.3em] text-emerald-300">
                  {new Date(note.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2 text-lg">
                <button
                  onClick={() => startEdit(note)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-500 transition-all hover:bg-emerald-100"
                  aria-label="Edit note"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M16.862 4.487l2.651 2.651m-9.193 9.193l-3.34.689.688-3.34 9.194-9.193a1.875 1.875 0 012.651 2.651l-9.193 9.193z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button
                  onClick={() => setNoteToDelete(note)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-500 transition-all hover:bg-emerald-100"
                  aria-label="Delete note"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 7h12M9 7V5.5A1.5 1.5 0 0110.5 4h3A1.5 1.5 0 0115 5.5V7m1 0v11a2 2 0 01-2 2H10a2 2 0 01-2-2V7m3 4v6m4-6v6" />
                  </svg>
                </button>
              </div>
            </div>
            <p className="type-subtle mb-4 whitespace-pre-wrap text-sm leading-relaxed text-emerald-600/90">
              {note.content}
            </p>
            <div className="flex flex-wrap items-center justify-between text-xs text-emerald-300">
              <span>
                Created {new Date(note.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
              {note.updatedAt && <span>Updated {new Date(note.updatedAt).toLocaleDateString()}</span>}
            </div>
          </motion.div>
        ))}

        {filteredNotes.length === 0 && (
          <div className="col-span-full flex h-48 items-center justify-center rounded-2xl border border-dashed border-emerald-100 text-center text-emerald-300">
            {searchTerm
              ? "No notes match your search just yet."
              : "Your notebook is clear. Start by adding a new entry."}
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
        title="Action required"
        message={alertMsg || ""}
        onClose={() => setAlertMsg(null)}
      />
    </div>
  );
};

export default Notes;
