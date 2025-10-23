import { randomUUID } from "crypto";
import { ensureDatabase, sql } from "../db";

type TaskRow = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  due_date: Date | null;
  created_at: Date;
  updated_at: Date;
};

export type Task = {
  _id: string;
  userId: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

function mapTask(row: TaskRow): Task {
  return {
    _id: row.id,
    userId: row.user_id,
    title: row.title,
    description: row.description,
    status: row.status,
    priority: row.priority,
    dueDate: row.due_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listTasks(userId?: string) {
  await ensureDatabase();
  const result = userId
    ? await sql<TaskRow>`
        SELECT *
        FROM tasks
        WHERE user_id = ${userId}
        ORDER BY created_at DESC;
      `
    : await sql<TaskRow>`
        SELECT *
        FROM tasks
        ORDER BY created_at DESC;
      `;
  return result.rows.map(mapTask);
}

export async function findTask(id: string) {
  await ensureDatabase();
  const result = await sql<TaskRow>`
    SELECT *
    FROM tasks
    WHERE id = ${id}
    LIMIT 1;
  `;
  const task = result.rows[0];
  return task ? mapTask(task) : null;
}

export async function createTask(data: {
  userId: string;
  title: string;
  description?: string | null;
  status?: string;
  priority?: string;
  dueDate?: string | null;
}) {
  await ensureDatabase();
  const now = new Date();
  const id = randomUUID();
  const result = await sql<TaskRow>`
    INSERT INTO tasks (
      id,
      user_id,
      title,
      description,
      status,
      priority,
      due_date,
      created_at,
      updated_at
    )
    VALUES (
      ${id},
      ${data.userId},
      ${data.title},
      ${data.description ?? null},
      ${data.status ?? "pending"},
      ${data.priority ?? "medium"},
      ${data.dueDate ? new Date(data.dueDate) : null},
      ${now},
      ${now}
    )
    RETURNING *;
  `;
  return mapTask(result.rows[0]);
}

export async function updateTask(
  id: string,
  updates: Partial<{
    title: string;
    description: string | null;
    status: string;
    priority: string;
    dueDate: string | null;
  }>
) {
  await ensureDatabase();
  const now = new Date();
  const fields = [sql`updated_at = ${now}`];

  if (updates.title !== undefined) {
    fields.push(sql`title = ${updates.title}`);
  }

  if (updates.description !== undefined) {
    fields.push(sql`description = ${updates.description ?? null}`);
  }

  if (updates.status !== undefined) {
    fields.push(sql`status = ${updates.status}`);
  }

  if (updates.priority !== undefined) {
    fields.push(sql`priority = ${updates.priority}`);
  }

  if (updates.dueDate !== undefined) {
    fields.push(sql`due_date = ${updates.dueDate ? new Date(updates.dueDate) : null}`);
  }

  const result = await sql<TaskRow>`
    UPDATE tasks
    SET ${sql.join(fields, sql`, `)}
    WHERE id = ${id}
    RETURNING *;
  `;
  const row = result.rows[0];
  return row ? mapTask(row) : null;
}

export async function deleteTask(id: string) {
  await ensureDatabase();
  await sql`
    DELETE FROM tasks
    WHERE id = ${id};
  `;
}
