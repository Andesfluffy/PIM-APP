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
      fetch(`/api/contacts?userId=${userId}`)
        .then((res) => res.json())
        .then((data) =>
          setContacts(
            data.map((c: any) => ({
              id: c._id,
              ...c,
            }))
          )
        )
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
    if (!res.ok) {
      console.error(`Failed to create contact: ${res.status}`);
      return;
    }
    const newContact = await res.json();
    setContacts((prev) => [
      ...prev,
      {
        id: newContact._id,
        ...newContact,
      },
    ]);
  };

  const updateContact = async (id: string, updates: Partial<Contact>) => {
    const res = await fetch(`/api/contacts/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    const updated = await res.json();
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { id: updated._id, ...updated } : c))
    );
  };

  const deleteContact = async (id: string) => {
    await fetch(`/api/contacts/${id}`, { method: "DELETE" });
    setContacts((prev) => prev.filter((c) => c.id !== id));
  };

  return { contacts, createContact, updateContact, deleteContact };
}
