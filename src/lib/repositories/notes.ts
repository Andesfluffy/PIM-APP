import { randomUUID } from "crypto";
import { ensureDatabase, sql } from "../db";

type NoteRow = {
  id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: Date;
  updated_at: Date;
};

export type Note = {
  _id: string;
  userId: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
};

function mapNote(row: NoteRow): Note {
  return {
    _id: row.id,
    userId: row.user_id,
    title: row.title,
    content: row.content,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listNotes(userId?: string) {
  await ensureDatabase();
  const result = userId
    ? await sql<NoteRow>`
        SELECT *
        FROM notes
        WHERE user_id = ${userId}
        ORDER BY created_at DESC;
      `
    : await sql<NoteRow>`
        SELECT *
        FROM notes
        ORDER BY created_at DESC;
      `;
  return result.rows.map(mapNote);
}

export async function findNote(id: string, userId?: string) {
  await ensureDatabase();
  const result = userId
    ? await sql<NoteRow>`SELECT * FROM notes WHERE id = ${id} AND user_id = ${userId} LIMIT 1;`
    : await sql<NoteRow>`SELECT * FROM notes WHERE id = ${id} LIMIT 1;`;
  const note = result.rows[0];
  return note ? mapNote(note) : null;
}

export async function createNote(data: {
  userId: string;
  title: string;
  content: string;
}) {
  await ensureDatabase();
  const now = new Date();
  const id = randomUUID();
  const result = await sql<NoteRow>`
    INSERT INTO notes (id, user_id, title, content, created_at, updated_at)
    VALUES (${id}, ${data.userId}, ${data.title}, ${data.content}, ${now}, ${now})
    RETURNING *;
  `;
  return mapNote(result.rows[0]);
}

export async function updateNote(
  id: string,
  updates: Partial<Pick<Note, "title" | "content">>,
  userId?: string
) {
  await ensureDatabase();
  const now = new Date();
  const result = userId
    ? await sql<NoteRow>`
        UPDATE notes
        SET title = COALESCE(${updates.title ?? null}, title),
            content = COALESCE(${updates.content ?? null}, content),
            updated_at = ${now}
        WHERE id = ${id} AND user_id = ${userId}
        RETURNING *;
      `
    : await sql<NoteRow>`
        UPDATE notes
        SET title = COALESCE(${updates.title ?? null}, title),
            content = COALESCE(${updates.content ?? null}, content),
            updated_at = ${now}
        WHERE id = ${id}
        RETURNING *;
      `;
  const row = result.rows[0];
  return row ? mapNote(row) : null;
}

export async function deleteNote(id: string, userId?: string) {
  await ensureDatabase();
  if (userId) {
    await sql`DELETE FROM notes WHERE id = ${id} AND user_id = ${userId};`;
  } else {
    await sql`DELETE FROM notes WHERE id = ${id};`;
  }
}
