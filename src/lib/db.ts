import { createClient, sql as pooledSql } from "@vercel/postgres";

let sql = pooledSql;
let initialized = false;
let connectionPromise: Promise<void> | null = null;

async function ensureClientConnection() {
  if (process.env.POSTGRES_URL) {
    return;
  }

  const connectionString = process.env.POSTGRES_URL_NON_POOLING;
  if (!connectionString) {
    return;
  }

  if (!connectionPromise) {
    const client = createClient({ connectionString });
    sql = client.sql;
    connectionPromise = client.connect();
  }

  await connectionPromise;
}

async function createTables() {
  await sql`
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS contacts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      created_at TIMESTAMPTZ NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL,
      priority TEXT NOT NULL,
      due_date TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL
    );
  `;

  // Helpful indexes for performance
  await sql`
    CREATE INDEX IF NOT EXISTS idx_notes_user_created ON notes (user_id, created_at DESC);
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_contacts_user_created ON contacts (user_id, created_at DESC);
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_tasks_user_created ON tasks (user_id, created_at DESC);
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_tasks_user_status ON tasks (user_id, status);
  `;
}

export async function ensureDatabase() {
  // Ensure a Postgres connection string is configured
  if (!process.env.POSTGRES_URL && !process.env.POSTGRES_URL_NON_POOLING) {
    throw new Error(
      "Missing Postgres connection string. Set POSTGRES_URL (or POSTGRES_URL_NON_POOLING) in .env.local."
    );
  }
  if (initialized) return;
  await ensureClientConnection();
  await createTables();
  initialized = true;
}

export { sql };
