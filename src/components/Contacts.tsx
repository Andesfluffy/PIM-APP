"use client";

import { Contact, useContacts } from "@/hooks/useContacts";
import { useState } from "react";
import { motion } from "framer-motion";
import AlertDialog from "./AlertDialog";
import ConfirmDialog from "./ConfirmDialog";

type ContactsProps = {
  userId?: string;
  onBackToDashboard: () => void;
};

type ContactErrors = {
  name?: string;
  email?: string;
  phone?: string;
};

const Contacts = ({ userId, onBackToDashboard }: ContactsProps) => {
  const { contacts, createContact, updateContact, deleteContact } =
    useContacts(userId);
  const [isCreating, setIsCreating] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [newContact, setNewContact] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [alertMsg, setAlertMsg] = useState<string | null>(null);
  const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);
  const [formErrors, setFormErrors] = useState<ContactErrors>({});

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\+?[0-9\-\s()]{0,20}$/;

  const resetForm = () => {
    setNewContact({ name: "", email: "", phone: "" });
    setIsCreating(false);
    setEditingContact(null);
    setFormErrors({});
  };

  const validateForm = () => {
    const errors: ContactErrors = {};
    if (!newContact.name.trim()) {
      errors.name = "A contact name is required.";
    }
    if (!emailRegex.test(newContact.email.trim())) {
      errors.email = "Please enter a valid email.";
    }
    if (newContact.phone && !phoneRegex.test(newContact.phone.trim())) {
      errors.phone = "Use digits, spaces, parentheses, or dashes only.";
    }
    setFormErrors(errors);
    return errors;
  };

  const handleCreate = () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setAlertMsg("Please fix the highlighted contact fields before saving.");
      return;
    }

    createContact({
      name: newContact.name.trim(),
      email: newContact.email.trim(),
      phone: newContact.phone.trim() || undefined,
      userId,
    });
    resetForm();
  };

  const handleUpdate = () => {
    if (!editingContact) return;
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setAlertMsg("Please fix the highlighted contact fields before updating.");
      return;
    }

    updateContact(editingContact.id, {
      name: newContact.name.trim(),
      email: newContact.email.trim(),
      phone: newContact.phone.trim() || undefined,
      userId,
    });
    resetForm();
  };

  const startEdit = (contact: Contact) => {
    setEditingContact(contact);
    setNewContact({
      name: contact.name,
      email: contact.email,
      phone: contact.phone || "",
    });
    setFormErrors({});
    setIsCreating(true);
  };

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (contact.phone && contact.phone.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="glass-card rounded-3xl border border-emerald-200/70 bg-white/80 p-6 shadow-[0_32px_70px_-40px_rgba(12,74,48,0.55)] backdrop-blur">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-3 text-3xl font-bold text-emerald-600">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
              <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0z" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M6 19a6 6 0 0112 0" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            Contacts
          </h2>
          <p className="text-sm text-emerald-500">Cherish every connection in one pretty place.</p>
        </div>
        <button
          onClick={() => {
            setIsCreating(true);
            setFormErrors({});
          }}
          className="rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-lime-300 px-5 py-2 text-sm font-semibold text-emerald-900 shadow-md shadow-emerald-200 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-emerald-200"
        >
          + New Contact
        </button>
      </div>

      <div className="mb-5">
        <label className="sr-only" htmlFor="contact-search">
          Search contacts
        </label>
        <input
          id="contact-search"
          type="text"
          placeholder="Search contacts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-2xl border border-emerald-200/70 bg-white/80 px-4 py-3 text-emerald-700 placeholder:text-emerald-300 shadow-inner focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200"
        />
      </div>

      {isCreating && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-2xl border border-emerald-200/70 bg-white/85 p-5 shadow-lg shadow-emerald-100"
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold text-emerald-600" htmlFor="contact-name">
                Name
              </label>
              <input
                id="contact-name"
                type="text"
                placeholder="Full name..."
                value={newContact.name}
                onChange={(e) => {
                  const value = e.target.value;
                  setNewContact((prev) => ({ ...prev, name: value }));
                  if (formErrors.name && value.trim()) {
                    setFormErrors((prev) => ({ ...prev, name: undefined }));
                  }
                }}
                className={`w-full rounded-xl border px-4 py-3 text-emerald-700 placeholder:text-emerald-300 focus:outline-none focus:ring-2 ${
                  formErrors.name
                    ? "border-emerald-400 bg-emerald-50 focus:ring-emerald-300"
                    : "border-emerald-200 bg-white/70 focus:border-emerald-300 focus:ring-emerald-200"
                }`}
              />
              {formErrors.name && (
                <p className="mt-1 text-sm text-emerald-600">{formErrors.name}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-emerald-600" htmlFor="contact-email">
                Email
              </label>
              <input
                id="contact-email"
                type="email"
                placeholder="Email address..."
                value={newContact.email}
                onChange={(e) => {
                  const value = e.target.value;
                  setNewContact((prev) => ({ ...prev, email: value }));
                  if (formErrors.email && emailRegex.test(value.trim())) {
                    setFormErrors((prev) => ({ ...prev, email: undefined }));
                  }
                }}
                className={`w-full rounded-xl border px-4 py-3 text-emerald-700 placeholder:text-emerald-300 focus:outline-none focus:ring-2 ${
                  formErrors.email
                    ? "border-emerald-400 bg-emerald-50 focus:ring-emerald-300"
                    : "border-emerald-200 bg-white/70 focus:border-emerald-300 focus:ring-emerald-200"
                }`}
              />
              {formErrors.email && (
                <p className="mt-1 text-sm text-emerald-600">{formErrors.email}</p>
              )}
            </div>
          </div>
          <div className="mt-4">
            <label className="mb-1 block text-sm font-semibold text-emerald-600" htmlFor="contact-phone">
              Phone (optional)
            </label>
            <input
              id="contact-phone"
              type="tel"
              placeholder="Phone number..."
              value={newContact.phone}
              onChange={(e) => {
                const value = e.target.value;
                setNewContact((prev) => ({ ...prev, phone: value }));
                if (formErrors.phone && phoneRegex.test(value.trim())) {
                  setFormErrors((prev) => ({ ...prev, phone: undefined }));
                }
              }}
              className={`w-full rounded-xl border px-4 py-3 text-emerald-700 placeholder:text-emerald-300 focus:outline-none focus:ring-2 ${
                formErrors.phone
                  ? "border-emerald-400 bg-emerald-50 focus:ring-emerald-300"
                  : "border-emerald-200 bg-white/70 focus:border-emerald-300 focus:ring-emerald-200"
              }`}
            />
            {formErrors.phone && (
              <p className="mt-1 text-sm text-emerald-600">{formErrors.phone}</p>
            )}
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={editingContact ? handleUpdate : handleCreate}
              className="rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-lime-300 px-4 py-2 text-sm font-semibold text-emerald-900 shadow-md shadow-emerald-200 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-emerald-200"
            >
              {editingContact ? "Update" : "Create"}
            </button>
            <button
              onClick={resetForm}
              className="rounded-xl border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-500 transition-colors hover:border-emerald-300 hover:text-emerald-600"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      <div className="max-h-96 space-y-3 overflow-y-auto pr-1">
        {filteredContacts.map((contact) => (
          <motion.div
            key={contact.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-emerald-200/70 bg-white/80 p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-md"
          >
            <div className="mb-2 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-emerald-700">{contact.name}</h3>
                <p className="text-sm text-emerald-500">{contact.email}</p>
                {contact.phone && (
                  <p className="text-sm text-emerald-500/80">{contact.phone}</p>
                )}
              </div>
              <div className="flex gap-2 text-lg">
                <button
                  onClick={() => startEdit(contact)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 transition-all hover:bg-emerald-200"
                  aria-label="Edit contact"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M16.862 4.487l2.651 2.651m-9.193 9.193l-3.34.689.688-3.34 9.194-9.193a1.875 1.875 0 012.651 2.651l-9.193 9.193z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button
                  onClick={() => setContactToDelete(contact)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 transition-all hover:bg-emerald-200"
                  aria-label="Delete contact"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 7h12M9 7V5.5A1.5 1.5 0 0110.5 4h3A1.5 1.5 0 0115 5.5V7m1 0v11a2 2 0 01-2 2H10a2 2 0 01-2-2V7m3 4v6m4-6v6" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between text-xs text-emerald-400">
              <span>Created: {new Date(contact.createdAt).toLocaleDateString()}</span>
              {contact.updatedAt && (
                <span>Updated: {new Date(contact.updatedAt).toLocaleDateString()}</span>
              )}
            </div>
          </motion.div>
        ))}

        {filteredContacts.length === 0 && (
          <div className="py-10 text-center text-emerald-400">
            {searchTerm
              ? "No contacts found matching your search."
              : "No contacts yet. Add your first one!"}
          </div>
        )}
      </div>

      <div className="mt-6">
        <button
          onClick={onBackToDashboard}
          className="text-sm font-semibold text-emerald-600 transition-colors hover:text-emerald-700"
        >
          ← Back to dashboard
        </button>
      </div>

      <ConfirmDialog
        isOpen={!!contactToDelete}
        title="Delete Contact"
        message="Are you sure you want to delete this contact? This action cannot be undone."
        onConfirm={() => {
          if (contactToDelete) {
            deleteContact(contactToDelete.id);
            setContactToDelete(null);
          }
        }}
        onCancel={() => setContactToDelete(null)}
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

export default Contacts;
