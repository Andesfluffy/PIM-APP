"use client";

import { useEffect, useState } from "react";

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export function useContacts(userId: string | undefined) {
  const [contacts, setContacts] = useState<Contact[]>([]);

  useEffect(() => {
    if (userId) {
      fetch("/api/contacts")
        .then((res) => res.json())
        .then(setContacts)
        .catch(console.error);
    }
  }, [userId]);

  const createContact = async (
    contact: Omit<Contact, "id" | "createdAt" | "updatedAt">
  ) => {
    const res = await fetch("/api/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(contact),
    });
    const newContact = await res.json();
    setContacts((prev) => [...prev, newContact]);
  };

  const updateContact = async (id: string, updates: Partial<Contact>) => {
    const res = await fetch(`/api/contacts/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    const updated = await res.json();
    setContacts((prev) => prev.map((c) => (c.id === id ? updated : c)));
  };

  const deleteContact = async (id: string) => {
    await fetch(`/api/contacts/${id}`, { method: "DELETE" });
    setContacts((prev) => prev.filter((c) => c.id !== id));
  };

  return { contacts, createContact, updateContact, deleteContact };
}
