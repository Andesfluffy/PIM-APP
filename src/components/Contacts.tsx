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
    <div className="glass-card rounded-3xl border border-rose-200/60 p-6 shadow-lg shadow-rose-100">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-3 text-3xl font-bold text-rose-600">
            <span className="text-4xl">📇</span>
            Contacts
          </h2>
          <p className="text-sm text-rose-500">Cherish every connection in one pretty place.</p>
        </div>
        <button
          onClick={() => {
            setIsCreating(true);
            setFormErrors({});
          }}
          className="rounded-2xl bg-gradient-to-r from-rose-400 via-pink-300 to-amber-300 px-5 py-2 text-sm font-semibold text-rose-900 shadow-md shadow-rose-200 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-rose-200"
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
          className="w-full rounded-2xl border border-rose-200/70 bg-white/80 px-4 py-3 text-rose-700 placeholder:text-rose-300 shadow-inner focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-200"
        />
      </div>

      {isCreating && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-2xl border border-rose-200/70 bg-white/85 p-5 shadow-md"
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold text-rose-500" htmlFor="contact-name">
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
                className={`w-full rounded-xl border px-4 py-3 text-rose-700 placeholder:text-rose-300 focus:outline-none focus:ring-2 ${
                  formErrors.name
                    ? "border-rose-400 bg-rose-50 focus:ring-rose-300"
                    : "border-rose-200 bg-white/70 focus:border-rose-300 focus:ring-rose-200"
                }`}
              />
              {formErrors.name && (
                <p className="mt-1 text-sm text-rose-500">{formErrors.name}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-rose-500" htmlFor="contact-email">
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
                className={`w-full rounded-xl border px-4 py-3 text-rose-700 placeholder:text-rose-300 focus:outline-none focus:ring-2 ${
                  formErrors.email
                    ? "border-rose-400 bg-rose-50 focus:ring-rose-300"
                    : "border-rose-200 bg-white/70 focus:border-rose-300 focus:ring-rose-200"
                }`}
              />
              {formErrors.email && (
                <p className="mt-1 text-sm text-rose-500">{formErrors.email}</p>
              )}
            </div>
          </div>
          <div className="mt-4">
            <label className="mb-1 block text-sm font-semibold text-rose-500" htmlFor="contact-phone">
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
              className={`w-full rounded-xl border px-4 py-3 text-rose-700 placeholder:text-rose-300 focus:outline-none focus:ring-2 ${
                formErrors.phone
                  ? "border-rose-400 bg-rose-50 focus:ring-rose-300"
                  : "border-rose-200 bg-white/70 focus:border-rose-300 focus:ring-rose-200"
              }`}
            />
            {formErrors.phone && (
              <p className="mt-1 text-sm text-rose-500">{formErrors.phone}</p>
            )}
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={editingContact ? handleUpdate : handleCreate}
              className="rounded-xl bg-gradient-to-r from-rose-400 via-pink-400 to-amber-300 px-4 py-2 text-sm font-semibold text-rose-900 shadow-md shadow-rose-200 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-rose-200"
            >
              {editingContact ? "Update" : "Create"}
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
        {filteredContacts.map((contact) => (
          <motion.div
            key={contact.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-rose-200/70 bg-white/80 p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-rose-300 hover:shadow-md"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-rose-300 to-pink-200 text-lg font-bold text-rose-700">
                {contact.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .substring(0, 2)}
              </div>
              <div className="flex-1">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <h3 className="text-lg font-semibold text-rose-600">{contact.name}</h3>
                  <div className="flex gap-2 text-lg">
                    <button
                      onClick={() => startEdit(contact)}
                      className="rounded-full bg-rose-100 px-2 py-1 text-rose-500 transition-colors hover:bg-rose-200"
                      aria-label="Edit contact"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => setContactToDelete(contact)}
                      className="rounded-full bg-rose-100 px-2 py-1 text-rose-500 transition-colors hover:bg-rose-200"
                      aria-label="Delete contact"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <div className="space-y-1 text-sm">
                  <p className="flex items-center gap-2 text-rose-500">
                    <span>📧</span>
                    <a
                      href={`mailto:${contact.email}`}
                      className="text-rose-500 underline decoration-rose-300 decoration-dotted underline-offset-4 hover:text-rose-600"
                    >
                      {contact.email}
                    </a>
                  </p>
                  {contact.phone && (
                    <p className="flex items-center gap-2 text-rose-500">
                      <span>📞</span>
                      <a
                        href={`tel:${contact.phone}`}
                        className="text-rose-500 underline decoration-rose-300 decoration-dotted underline-offset-4 hover:text-rose-600"
                      >
                        {contact.phone}
                      </a>
                    </p>
                  )}
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-between text-xs text-rose-300">
                  <span>Created: {new Date(contact.createdAt).toLocaleDateString()}</span>
                  <span>Updated: {new Date(contact.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {filteredContacts.length === 0 && (
          <div className="py-10 text-center text-rose-400">
            {searchTerm
              ? "No contacts found matching your search."
              : "No contacts yet. Add your first contact!"}
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
