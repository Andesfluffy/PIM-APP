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
      errors.name = "Please add the contact's name.";
    }
    if (!emailRegex.test(newContact.email.trim())) {
      errors.email = "Enter a valid email address.";
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
      setAlertMsg("Resolve the highlighted fields before saving the contact.");
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
      setAlertMsg("Resolve the highlighted fields before updating the contact.");
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
    <div className="rounded-[32px] border border-emerald-100/70 bg-white/80 p-8 shadow-[0_40px_80px_-55px_rgba(12,74,48,0.6)] backdrop-blur-xl">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-3 rounded-full bg-emerald-100/80 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.35em] text-emerald-500">
            Contacts
          </div>
          <h2 className="text-3xl text-emerald-800">Nurture every relationship with ease</h2>
          <p className="type-subtle text-sm text-emerald-600/80">
            Maintain an elegant directory with smart filters and concise profile cards.
          </p>
        </div>
        <button
          onClick={() => {
            setIsCreating(true);
            setFormErrors({});
          }}
          className="rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-lime-300 px-6 py-3 text-sm font-semibold text-emerald-900 shadow-[0_18px_36px_-20px_rgba(16,94,67,0.45)] transition-transform duration-300 hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-emerald-200"
        >
          Add contact
        </button>
      </div>

      <div className="mb-6">
        <label className="sr-only" htmlFor="contact-search">
          Search contacts
        </label>
        <div className="relative">
          <input
            id="contact-search"
            type="text"
            placeholder="Search contacts by name, email, or number"
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
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-emerald-600" htmlFor="contact-name">
                Name
              </label>
              <input
                id="contact-name"
                type="text"
                placeholder="Full name"
                value={newContact.name}
                onChange={(e) => {
                  const value = e.target.value;
                  setNewContact((prev) => ({ ...prev, name: value }));
                  if (formErrors.name && value.trim()) {
                    setFormErrors((prev) => ({ ...prev, name: undefined }));
                  }
                }}
                className={`w-full rounded-xl border px-4 py-3 text-sm text-emerald-700 placeholder:text-emerald-200 focus:outline-none focus:ring-2 ${
                  formErrors.name
                    ? "border-emerald-400 bg-emerald-50 focus:ring-emerald-300"
                    : "border-emerald-100 bg-white/80 focus:border-emerald-300 focus:ring-emerald-200"
                }`}
              />
              {formErrors.name && (
                <p className="mt-1 text-sm text-emerald-600">{formErrors.name}</p>
              )}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-emerald-600" htmlFor="contact-email">
                Email
              </label>
              <input
                id="contact-email"
                type="email"
                placeholder="Email address"
                value={newContact.email}
                onChange={(e) => {
                  const value = e.target.value;
                  setNewContact((prev) => ({ ...prev, email: value }));
                  if (formErrors.email && emailRegex.test(value.trim())) {
                    setFormErrors((prev) => ({ ...prev, email: undefined }));
                  }
                }}
                className={`w-full rounded-xl border px-4 py-3 text-sm text-emerald-700 placeholder:text-emerald-200 focus:outline-none focus:ring-2 ${
                  formErrors.email
                    ? "border-emerald-400 bg-emerald-50 focus:ring-emerald-300"
                    : "border-emerald-100 bg-white/80 focus:border-emerald-300 focus:ring-emerald-200"
                }`}
              />
              {formErrors.email && (
                <p className="mt-1 text-sm text-emerald-600">{formErrors.email}</p>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-semibold text-emerald-600" htmlFor="contact-phone">
                Phone (optional)
              </label>
              <input
                id="contact-phone"
                type="tel"
                placeholder="Phone number"
                value={newContact.phone}
                onChange={(e) => {
                  const value = e.target.value;
                  setNewContact((prev) => ({ ...prev, phone: value }));
                  if (formErrors.phone && phoneRegex.test(value.trim())) {
                    setFormErrors((prev) => ({ ...prev, phone: undefined }));
                  }
                }}
                className={`w-full rounded-xl border px-4 py-3 text-sm text-emerald-700 placeholder:text-emerald-200 focus:outline-none focus:ring-2 ${
                  formErrors.phone
                    ? "border-emerald-400 bg-emerald-50 focus:ring-emerald-300"
                    : "border-emerald-100 bg-white/80 focus:border-emerald-300 focus:ring-emerald-200"
                }`}
              />
              {formErrors.phone && (
                <p className="mt-1 text-sm text-emerald-600">{formErrors.phone}</p>
              )}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={editingContact ? handleUpdate : handleCreate}
              className="rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-[0_18px_35px_-22px_rgba(16,94,67,0.55)] transition-transform duration-200 hover:-translate-y-0.5 hover:bg-emerald-700"
            >
              {editingContact ? "Update contact" : "Create contact"}
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
        {filteredContacts.map((contact) => (
          <motion.div
            key={contact.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="group rounded-2xl border border-emerald-100/70 bg-white/85 p-5 shadow-sm shadow-emerald-50 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_20px_35px_-30px_rgba(12,74,48,0.55)]"
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-emerald-800">{contact.name}</h3>
                <p className="type-subtle text-sm text-emerald-600/90">{contact.email}</p>
                {contact.phone && (
                  <p className="type-subtle text-sm text-emerald-500">{contact.phone}</p>
                )}
              </div>
              <div className="flex gap-2 text-lg">
                <button
                  onClick={() => startEdit(contact)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-500 transition-all hover:bg-emerald-100"
                  aria-label="Edit contact"
                >
                  ✏️
                </button>
                <button
                  onClick={() => setContactToDelete(contact)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-500 transition-all hover:bg-emerald-100"
                  aria-label="Delete contact"
                >
                  🗑️
                </button>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between text-xs text-emerald-300">
              <span>Added {new Date(contact.createdAt).toLocaleDateString()}</span>
              {contact.updatedAt && (
                <span>Updated {new Date(contact.updatedAt).toLocaleDateString()}</span>
              )}
            </div>
          </motion.div>
        ))}

        {filteredContacts.length === 0 && (
          <div className="col-span-full flex h-48 items-center justify-center rounded-2xl border border-dashed border-emerald-100 text-center text-emerald-300">
            {searchTerm
              ? "No contacts match your search yet."
              : "Your address book is clear. Add your first contact."}
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
        title="Action required"
        message={alertMsg || ""}
        onClose={() => setAlertMsg(null)}
      />
    </div>
  );
};

export default Contacts;
