import { randomUUID } from "crypto";
import { ensureDatabase, sql } from "../db";

type ContactRow = {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string | null;
  created_at: Date;
  updated_at: Date;
};

export type Contact = {
  _id: string;
  userId: string;
  name: string;
  email: string;
  phone: string | null;
  createdAt: Date;
  updatedAt: Date;
};

function mapContact(row: ContactRow): Contact {
  return {
    _id: row.id,
    userId: row.user_id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listContacts(userId?: string) {
  await ensureDatabase();
  const result = userId
    ? await sql<ContactRow>`
        SELECT *
        FROM contacts
        WHERE user_id = ${userId}
        ORDER BY created_at DESC;
      `
    : await sql<ContactRow>`
        SELECT *
        FROM contacts
        ORDER BY created_at DESC;
      `;
  return result.rows.map(mapContact);
}

export async function findContact(id: string, userId?: string) {
  await ensureDatabase();
  const result = userId
    ? await sql<ContactRow>`SELECT * FROM contacts WHERE id = ${id} AND user_id = ${userId} LIMIT 1;`
    : await sql<ContactRow>`SELECT * FROM contacts WHERE id = ${id} LIMIT 1;`;
  const contact = result.rows[0];
  return contact ? mapContact(contact) : null;
}

export async function createContact(data: {
  userId: string;
  name: string;
  email: string;
  phone?: string | null;
}) {
  await ensureDatabase();
  const now = new Date();
  const id = randomUUID();
  const result = await sql<ContactRow>`
    INSERT INTO contacts (id, user_id, name, email, phone, created_at, updated_at)
    VALUES (${id}, ${data.userId}, ${data.name}, ${data.email}, ${data.phone ?? null}, ${now}, ${now})
    RETURNING *;
  `;
  return mapContact(result.rows[0]);
}

export async function updateContact(
  id: string,
  updates: Partial<Pick<Contact, "name" | "email" | "phone">>,
  userId?: string
) {
  await ensureDatabase();
  const now = new Date();
  const result = userId
    ? await sql<ContactRow>`
        UPDATE contacts
        SET name = COALESCE(${updates.name ?? null}, name),
            email = COALESCE(${updates.email ?? null}, email),
            phone = COALESCE(${updates.phone ?? null}, phone),
            updated_at = ${now}
        WHERE id = ${id} AND user_id = ${userId}
        RETURNING *;
      `
    : await sql<ContactRow>`
        UPDATE contacts
        SET name = COALESCE(${updates.name ?? null}, name),
            email = COALESCE(${updates.email ?? null}, email),
            phone = COALESCE(${updates.phone ?? null}, phone),
            updated_at = ${now}
        WHERE id = ${id}
        RETURNING *;
      `;
  const row = result.rows[0];
  return row ? mapContact(row) : null;
}

export async function deleteContact(id: string, userId?: string) {
  await ensureDatabase();
  if (userId) {
    await sql`DELETE FROM contacts WHERE id = ${id} AND user_id = ${userId};`;
  } else {
    await sql`DELETE FROM contacts WHERE id = ${id};`;
  }
}
