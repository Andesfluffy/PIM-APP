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

export async function findContact(id: string) {
  await ensureDatabase();
  const result = await sql<ContactRow>`
    SELECT *
    FROM contacts
    WHERE id = ${id}
    LIMIT 1;
  `;
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
  updates: Partial<Pick<Contact, "name" | "email" | "phone">>
) {
  await ensureDatabase();
  const now = new Date();
  const fields = [sql`updated_at = ${now}`];

  if (updates.name !== undefined) {
    fields.push(sql`name = ${updates.name}`);
  }

  if (updates.email !== undefined) {
    fields.push(sql`email = ${updates.email}`);
  }

  if (updates.phone !== undefined) {
    fields.push(sql`phone = ${updates.phone ?? null}`);
  }

  const result = await sql<ContactRow>`
    UPDATE contacts
    SET ${sql.join(fields, sql`, `)}
    WHERE id = ${id}
    RETURNING *;
  `;
  const row = result.rows[0];
  return row ? mapContact(row) : null;
}

export async function deleteContact(id: string) {
  await ensureDatabase();
  await sql`
    DELETE FROM contacts
    WHERE id = ${id};
  `;
}
