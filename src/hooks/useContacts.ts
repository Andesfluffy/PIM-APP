// "use client";

// import { useEffect, useState } from "react";

// export interface Contact {
//   id: string;
//   name: string;
//   email: string;
//   phone?: string;
//   createdAt: Date;
//   updatedAt: Date;
//   userId: string;
// }

// export function useContacts(userId: string | undefined) {
//   const [contacts, setContacts] = useState<Contact[]>([]);

//   useEffect(() => {
//     if (userId) {
//       const savedContacts = localStorage.getItem(`contacts_${userId}`);
//       if (savedContacts) {
//         const parsedContacts = JSON.parse(savedContacts).map(
//           (contact: any) => ({
//             ...contact,
//             createdAt: new Date(contact.createdAt),
//             updatedAt: new Date(contact.updatedAt),
//           })
//         );
//         setContacts(parsedContacts);
//       }
//     }
//   }, [userId]);

//   const saveContacts = (newContacts: Contact[]) => {
//     if (userId) {
//       setContacts(newContacts);
//       localStorage.setItem(`contacts_${userId}`, JSON.stringify(newContacts));
//     }
//   };

//   const createContact = (name: string, email: string, phone?: string) => {
//     if (!userId) return;
//     const newContact: Contact = {
//       id: `contact_${Date.now()}`,
//       name,
//       email,
//       phone,
//       createdAt: new Date(),
//       updatedAt: new Date(),
//       userId,
//     };
//     const updatedContacts = [newContact, ...contacts];
//     saveContacts(updatedContacts);
//   };

//   const updateContact = (
//     id: string,
//     name: string,
//     email: string,
//     phone?: string
//   ) => {
//     const updatedContacts = contacts.map((contact) =>
//       contact.id === id
//         ? { ...contact, name, email, phone, updatedAt: new Date() }
//         : contact
//     );
//     saveContacts(updatedContacts);
//   };

//   const deleteContact = (id: string) => {
//     const updatedContacts = contacts.filter((contact) => contact.id !== id);
//     saveContacts(updatedContacts);
//   };

//   return { contacts, createContact, updateContact, deleteContact };
// }

"use client";

import { useEffect, useState } from "react";

export interface Contact {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export function useContacts(userId: string | undefined) {
  const [contacts, setContacts] = useState<Contact[]>([]);

  useEffect(() => {
    if (userId) {
      fetch(`/api/contacts`)
        .then(async (res) => {
          if (!res.ok) {
            if (res.status === 401) return [] as any[];
            throw new Error(`HTTP ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          const list = Array.isArray(data) ? data : [];
          setContacts(
            list.map((c: any) => ({
              id: c._id,
              ...c,
              phone: c.phone ?? null,
              email: c.email ?? null,
            }))
          );
        })
        .catch((err) => {
          if (String(err?.message || "").includes("401")) {
            setContacts([]);
            return;
          }
          console.error("GET /api/contacts failed", err);
          setContacts([]);
        });
    }
  }, [userId]);

  // Light revalidation on window focus
  useEffect(() => {
    if (!userId) return;
    const onFocus = () => {
      fetch(`/api/contacts`)
        .then(async (res) => {
          if (!res.ok) {
            if (res.status === 401) return [] as any[];
            throw new Error(`HTTP ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          const list = Array.isArray(data) ? data : [];
          setContacts(
            list.map((c: any) => ({
              id: c._id,
              ...c,
              phone: c.phone ?? null,
              email: c.email ?? null,
            }))
          );
        })
        .catch(() => {});
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [userId]);

  const createContact = async (
    contact: Omit<Contact, "id" | "createdAt" | "updatedAt">
  ) => {
    const nowIso = new Date().toISOString();
    const tempId = `temp_${Date.now()}`;
    const tempContact: Contact = {
      id: tempId,
      name: contact.name,
      email: contact.email ?? null,
      phone: contact.phone ?? null,
      createdAt: nowIso,
      updatedAt: nowIso,
      userId: userId || "",
    };

    // Optimistically add to the top
    setContacts((prev) => [tempContact, ...prev]);

    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contact),
      });
      if (!res.ok) throw new Error(`Failed to create contact: ${res.status}`);
      const newContact = await res.json();
      setContacts((prev) =>
        prev.map((c) =>
          c.id === tempId
            ? {
                id: newContact._id,
                ...newContact,
                email: newContact.email ?? null,
                phone: newContact.phone ?? null,
              }
            : c
        )
      );
    } catch (err) {
      console.error(err);
      // Revert optimistic insert
      setContacts((prev) => prev.filter((c) => c.id !== tempId));
    }
  };

  const updateContact = async (id: string, updates: Partial<Contact>) => {
    // Optimistic update
    const prevContacts = contacts.slice();
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c))
    );

    try {
      const res = await fetch(`/api/contacts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error(`Failed to update contact: ${res.status}`);
      const updated = await res.json();
      setContacts((prev) =>
        prev.map((c) => (c.id === id ? { id: updated._id, ...updated } : c))
      );
    } catch (err) {
      console.error(err);
      // Revert
      setContacts(prevContacts);
    }
  };

  const deleteContact = async (id: string) => {
    await fetch(`/api/contacts/${id}`, { method: "DELETE" });
    setContacts((prev) => prev.filter((c) => c.id !== id));
  };

  return { contacts, createContact, updateContact, deleteContact };
}
