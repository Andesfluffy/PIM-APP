"use client";

import { Contact, useContacts } from "@/hooks/useContacts";
import {
  CONTACT_EMAIL_REGEX,
  CONTACT_PHONE_REGEX,
  MAX_PHONE_DIGITS,
  isValidEmail,
  isValidPhone,
  clampPhoneDigits,
  sanitizeContactInput,
} from "@/lib/validation/contact";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import AlertDialog from "./AlertDialog";
import ConfirmDialog from "./ConfirmDialog";

type ContactsProps = {
  userId?: string;
};

type ContactErrors = {
  name?: string;
  email?: string;
  phone?: string;
};

const Contacts = ({ userId }: ContactsProps) => {
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
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [alertMsg, setAlertMsg] = useState<string | null>(null);
  const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);
  const [formErrors, setFormErrors] = useState<ContactErrors>({});

  // Persist view mode selection
  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("contacts_view_mode") : null;
    if (saved === "grid" || saved === "list") setViewMode(saved);
  }, []);
  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem("contacts_view_mode", viewMode);
  }, [viewMode]);

  const resetForm = () => {
    setNewContact({ name: "", email: "", phone: "" });
    setIsCreating(false);
    setEditingContact(null);
    setFormErrors({});
  };

  const validateForm = () => {
    const errors: ContactErrors = {};
    const sanitized = sanitizeContactInput(newContact);

    if (!sanitized.name) {
      errors.name = "Please add the contact's name.";
    }
    if (!isValidEmail(sanitized.email)) {
      errors.email = "Enter a valid email address.";
    }
    if (!isValidPhone(sanitized.phone)) {
      errors.phone = "Use 7 to 11 digits without letters.";
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

    const sanitized = sanitizeContactInput(newContact);

    createContact({
      name: sanitized.name,
      email: sanitized.email,
      phone: sanitized.phone || undefined,
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

    const sanitized = sanitizeContactInput(newContact);

    updateContact(editingContact.id, {
      name: sanitized.name,
      email: sanitized.email,
      phone: sanitized.phone || undefined,
    });
    resetForm();
  };

  const startEdit = (contact: Contact) => {
    setEditingContact(contact);
    setNewContact({
      name: contact.name,
      email: contact.email,
      phone: clampPhoneDigits(contact.phone),
    });
    setFormErrors({});
    setIsCreating(true);
  };

  const filteredContacts = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return contacts.filter(
      (contact) =>
        contact.name.toLowerCase().includes(q) ||
        contact.email.toLowerCase().includes(q) ||
        (contact.phone && contact.phone.toLowerCase().includes(q))
    );
  }, [contacts, searchTerm]);

  return (
    <div className="rounded-[32px] border border-tea-green-700 bg-white/85 p-8 shadow-[0_40px_80px_-55px_rgba(1,25,54,0.4)] backdrop-blur-xl">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-3 rounded-full bg-naples-yellow-900 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.35em] text-oxford-blue-400">
            Contacts
          </div>
          <h2 className="text-3xl text-oxford-blue-500">Nurture every relationship with ease</h2>
          <p className="type-subtle text-sm text-charcoal-500/85">
            Maintain an elegant directory with smart filters and concise profile cards.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="inline-flex rounded-xl border border-tea-green-700 bg-white/85 p-1 text-xs">
            <button
              onClick={() => setViewMode("grid")}
              className={`rounded-lg px-3 py-1 font-semibold ${
                viewMode === "grid" ? "bg-naples-yellow-900 text-oxford-blue-500" : "text-oxford-blue-400"
              }`}
            >
              Cards
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`rounded-lg px-3 py-1 font-semibold ${
                viewMode === "list" ? "bg-naples-yellow-900 text-oxford-blue-500" : "text-oxford-blue-400"
              }`}
            >
              List
            </button>
          </div>
          <button
            onClick={() => {
              setIsCreating(true);
              setFormErrors({});
            }}
            className="rounded-2xl bg-gradient-to-r from-red-crayola-500 via-naples-yellow-400 to-tea-green-400 px-6 py-3 text-sm font-semibold text-oxford-blue-500 shadow-[0_18px_36px_-20px_rgba(1,25,54,0.35)] transition-transform duration-300 hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-red-crayola-200"
          >
            Add contact
          </button>
        </div>
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
            className="w-full rounded-2xl border border-tea-green-700 bg-white/75 px-5 py-3 text-sm text-oxford-blue-500 shadow-inner shadow-charcoal-900/10 placeholder:text-charcoal-400 focus:border-red-crayola-400 focus:outline-none focus:ring-2 focus:ring-red-crayola-200"
          />
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-charcoal-400">🔍</span>
        </div>
      </div>

      {isCreating && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-2xl border border-tea-green-700 bg-white/90 p-6 shadow-[0_20px_45px_-30px_rgba(1,25,54,0.35)]"
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-oxford-blue-500" htmlFor="contact-name">
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
                className={`w-full rounded-xl border px-4 py-3 text-sm text-oxford-blue-500 placeholder:text-charcoal-400 focus:outline-none focus:ring-2 ${
                  formErrors.name
                    ? "border-red-crayola-400 bg-red-crayola-900 focus:ring-red-crayola-200"
                    : "border-tea-green-700 bg-white/85 focus:border-red-crayola-400 focus:ring-red-crayola-200"
                }`}
              />
              {formErrors.name && (
                <p className="mt-1 text-sm text-red-crayola-500">{formErrors.name}</p>
              )}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-oxford-blue-500" htmlFor="contact-email">
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
                  if (formErrors.email && isValidEmail(value)) {
                    setFormErrors((prev) => ({ ...prev, email: undefined }));
                  }
                }}
                pattern={CONTACT_EMAIL_REGEX.source}
                className={`w-full rounded-xl border px-4 py-3 text-sm text-oxford-blue-500 placeholder:text-charcoal-400 focus:outline-none focus:ring-2 ${
                  formErrors.email
                    ? "border-red-crayola-400 bg-red-crayola-900 focus:ring-red-crayola-200"
                    : "border-tea-green-700 bg-white/85 focus:border-red-crayola-400 focus:ring-red-crayola-200"
                }`}
              />
              {formErrors.email && (
                <p className="mt-1 text-sm text-red-crayola-500">{formErrors.email}</p>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-semibold text-oxford-blue-500" htmlFor="contact-phone">
                Phone (optional)
              </label>
              <input
                id="contact-phone"
                type="tel"
                placeholder="Phone number"
                value={newContact.phone}
                onChange={(e) => {
                  const value = clampPhoneDigits(e.target.value);
                  setNewContact((prev) => ({ ...prev, phone: value }));
                  if (formErrors.phone && isValidPhone(value)) {
                    setFormErrors((prev) => ({ ...prev, phone: undefined }));
                  }
                }}
                inputMode="tel"
                pattern={CONTACT_PHONE_REGEX.source}
                maxLength={MAX_PHONE_DIGITS}
                className={`w-full rounded-xl border px-4 py-3 text-sm text-oxford-blue-500 placeholder:text-charcoal-400 focus:outline-none focus:ring-2 ${
                  formErrors.phone
                    ? "border-red-crayola-400 bg-red-crayola-900 focus:ring-red-crayola-200"
                    : "border-tea-green-700 bg-white/85 focus:border-red-crayola-400 focus:ring-red-crayola-200"
                }`}
              />
              {formErrors.phone && (
                <p className="mt-1 text-sm text-red-crayola-500">{formErrors.phone}</p>
              )}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={editingContact ? handleUpdate : handleCreate}
              className="rounded-xl bg-red-crayola-500 px-5 py-2 text-sm font-semibold text-white shadow-[0_18px_35px_-22px_rgba(237,37,78,0.35)] transition-transform duration-200 hover:-translate-y-0.5 hover:bg-red-crayola-600"
            >
              {editingContact ? "Update contact" : "Create contact"}
            </button>
            <button
              onClick={resetForm}
              className="rounded-xl border border-tea-green-700 bg-white/85 px-5 py-2 text-sm font-semibold text-oxford-blue-400 transition-colors hover:border-red-crayola-400 hover:text-red-crayola-500"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {viewMode === "grid" && (
      <div className="grid max-h-[420px] grid-cols-1 gap-4 overflow-y-auto pr-1 md:grid-cols-2 xl:grid-cols-3">
        {filteredContacts.map((contact) => (
          <motion.div
            key={contact.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="group rounded-2xl border border-tea-green-700 bg-white/90 p-5 shadow-sm shadow-charcoal-900/20 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_20px_35px_-30px_rgba(1,25,54,0.35)]"
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-oxford-blue-500">{contact.name}</h3>
                <p className="type-subtle text-sm text-charcoal-500/90">{contact.email}</p>
                {contact.phone && (
                  <p className="type-subtle text-sm text-oxford-blue-400">{contact.phone}</p>
                )}
              </div>
              <div className="flex gap-2 text-lg">
                <button
                  onClick={() => startEdit(contact)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-naples-yellow-900 text-oxford-blue-500 transition-all hover:bg-naples-yellow-800"
                  aria-label="Edit contact"
                >
                  ✏️
                </button>
                <button
                  onClick={() => setContactToDelete(contact)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-naples-yellow-900 text-oxford-blue-500 transition-all hover:bg-naples-yellow-800"
                  aria-label="Delete contact"
                >
                  🗑️
                </button>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between text-xs text-charcoal-400">
              <span>Added {new Date(contact.createdAt).toLocaleDateString()}</span>
              {contact.updatedAt && (
                <span>Updated {new Date(contact.updatedAt).toLocaleDateString()}</span>
              )}
            </div>
          </motion.div>
        ))}

        {filteredContacts.length === 0 && (
          <div className="col-span-full flex h-48 items-center justify-center rounded-2xl border border-dashed border-tea-green-700 text-center text-charcoal-400">
            {searchTerm
              ? "No contacts match your search yet."
              : "Your address book is clear. Add your first contact."}
          </div>
        )}
      </div>
      )}

      {viewMode === "list" && (
        <div className="max-h-[420px] overflow-y-auto pr-1">
          <div className="divide-y divide-tea-green-700 rounded-2xl border border-tea-green-700 bg-white/90">
            {filteredContacts.map((contact) => (
              <div
                key={contact.id}
                className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:gap-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                    <h3 className="truncate text-sm font-semibold text-oxford-blue-500">{contact.name}</h3>
                    <span className="shrink-0 text-left text-xs text-charcoal-400 sm:text-right">
                      {new Date(contact.updatedAt || contact.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="type-subtle mt-1 text-xs text-charcoal-500/90">
                    <span>{contact.email}</span>
                    {contact.phone && <span className="ml-2 text-oxford-blue-400">• {contact.phone}</span>}
                  </div>
                </div>
                <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:flex-nowrap sm:items-center sm:justify-end">
                  <button
                    onClick={() => startEdit(contact)}
                    className="flex-1 rounded-lg border border-tea-green-700 px-3 py-1 text-xs font-semibold text-oxford-blue-400 transition-colors hover:border-red-crayola-400 hover:text-red-crayola-500 sm:flex-none"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setContactToDelete(contact)}
                    className="flex-1 rounded-lg bg-naples-yellow-900 px-3 py-1 text-xs font-semibold text-oxford-blue-500 transition-colors hover:bg-naples-yellow-800 sm:flex-none"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {filteredContacts.length === 0 && (
              <div className="flex h-36 items-center justify-center text-charcoal-400">
                {searchTerm ? "No contacts match your search yet." : "Your address book is clear. Add your first contact."}
              </div>
            )}
          </div>
        </div>
      )}

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

