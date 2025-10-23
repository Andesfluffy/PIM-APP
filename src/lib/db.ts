import { createClient, sql as pooledSql } from "@vercel/postgres";

let sql = pooledSql;
let initialized = false;
let connectionPromise: Promise<void> | null = null;
let initializationPromise: Promise<void> | null = null;

function getDirectConnectionString() {
  return (
    process.env.POSTGRES_URL_NON_POOLING ?? process.env.POSTGRES_URL ?? null
  );
}

async function ensureClientConnection() {
  const connectionString = getDirectConnectionString();
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

function isInvalidConnectionString(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  return "code" in error && (error as { code?: string }).code === "invalid_connection_string";
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
}

async function initializeDatabase() {
  if (!process.env.POSTGRES_URL && process.env.POSTGRES_URL_NON_POOLING) {
    await ensureClientConnection();
    await createTables();
    initialized = true;
    return;
  }

  try {
    await createTables();
    initialized = true;
    return;
  } catch (error) {
    if (!isInvalidConnectionString(error)) {
      throw error;
    }
  }

  await ensureClientConnection();
  await createTables();
  initialized = true;
}

export async function ensureDatabase() {
  // Ensure a Postgres connection string is configured
  if (!process.env.POSTGRES_URL && !process.env.POSTGRES_URL_NON_POOLING) {
    throw new Error(
      "Missing Postgres connection string. Set POSTGRES_URL (or POSTGRES_URL_NON_POOLING) in .env.local."
    );
  }

  if (initialized) return;

  if (!initializationPromise) {
    initializationPromise = initializeDatabase().finally(() => {
      initializationPromise = null;
    });
  }

  await initializationPromise;
}

export { sql };
