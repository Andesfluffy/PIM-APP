"use client";

import { Contact, useContacts } from "@/hooks/useContacts";
import { useState } from "react";
import { motion } from "framer-motion";

type ContactsProps = {
  userId?: string;
  onBackToDashboard: () => void;
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

  const handleCreate = () => {
    if (newContact.name.trim() && newContact.email.trim()) {
      createContact({
        name: newContact.name,
        email: newContact.email,
        phone: newContact.phone || undefined,
        userId: userId || "",
      });
      setNewContact({ name: "", email: "", phone: "" });
      setIsCreating(false);
    }
  };

  const handleUpdate = () => {
    if (editingContact && newContact.name.trim() && newContact.email.trim()) {
      updateContact(editingContact.id, {
        name: newContact.name,
        email: newContact.email,
        phone: newContact.phone || undefined,
        userId,
      });
      setEditingContact(null);
      setNewContact({ name: "", email: "", phone: "" });
      setIsCreating(false);
    }
  };

  const startEdit = (contact: Contact) => {
    setEditingContact(contact);
    setNewContact({
      name: contact.name,
      email: contact.email,
      phone: contact.phone || "",
    });
    setIsCreating(true);
  };

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="glass-card p-6 rounded-2xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-white flex items-center gap-3">
          <span className="text-4xl">📇</span>
          Contacts
        </h2>
        <button
          onClick={() => setIsCreating(true)}
          className="bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-700 hover:to-purple-700 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105"
        >
          + New Contact
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search contacts..."
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <input
              type="text"
              placeholder="Full name..."
              value={newContact.name}
              onChange={(e) =>
                setNewContact({ ...newContact, name: e.target.value })
              }
              className="bg-transparent border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
            <input
              type="email"
              placeholder="Email address..."
              value={newContact.email}
              onChange={(e) =>
                setNewContact({ ...newContact, email: e.target.value })
              }
              className="bg-transparent border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>
          <input
            type="tel"
            placeholder="Phone number (optional)..."
            value={newContact.phone}
            onChange={(e) =>
              setNewContact({ ...newContact, phone: e.target.value })
            }
            className="w-full bg-transparent border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-purple-500 mb-3"
          />
          <div className="flex gap-2">
            <button
              onClick={editingContact ? handleUpdate : handleCreate}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded-lg text-sm font-medium"
            >
              {editingContact ? "Update" : "Create"}
            </button>
            <button
              onClick={() => {
                setIsCreating(false);
                setEditingContact(null);
                setNewContact({ name: "", email: "", phone: "" });
              }}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-1 rounded-lg text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredContacts.map((contact) => (
          <motion.div
            key={contact.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/10 p-4 rounded-xl border border-white/20 hover:border-white/30 transition-colors group"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                {contact.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .substring(0, 2)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-white font-semibold text-lg">
                    {contact.name}
                  </h3>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => startEdit(contact)}
                      className="text-blue-400 hover:text-blue-300 text-sm"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => deleteContact(contact.id)}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <div className="space-y-1 text-sm mb-2">
                  <p className="text-white/80 flex items-center gap-2">
                    <span>📧</span>
                    <a
                      href={`mailto:${contact.email}`}
                      className="hover:text-purple-300 transition-colors"
                    >
                      {contact.email}
                    </a>
                  </p>
                  {contact.phone && (
                    <p className="text-white/80 flex items-center gap-2">
                      <span>📞</span>
                      <a
                        href={`tel:${contact.phone}`}
                        className="hover:text-purple-300 transition-colors"
                      >
                        {contact.phone}
                      </a>
                    </p>
                  )}
                </div>
                <div className="flex justify-between items-center text-xs text-white/50">
                  <span>
                    Created: {new Date(contact.createdAt).toLocaleDateString()}
                  </span>
                  <span>
                    Updated: {new Date(contact.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {filteredContacts.length === 0 && (
          <div className="text-center text-white/50 py-8">
            {searchTerm
              ? "No contacts found matching your search."
              : "No contacts yet. Add your first contact!"}
          </div>
        )}
      </div>

      {/* ✅ Back Button */}
      <div className="mt-6">
        <button
          onClick={onBackToDashboard}
          className="text-purple-400 hover:text-purple-200 text-sm underline"
        >
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default Contacts;
