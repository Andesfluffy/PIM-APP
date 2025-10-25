import { createClient, sql as pooledSql } from "@vercel/postgres";

let sql = pooledSql;
let initialized = false;
let connectionPromise: Promise<void> | null = null;

function isInvalidConnStringError(err: unknown) {
  const msg = (err as any)?.message || String(err);
  return typeof msg === "string" && msg.includes("invalid_connection_string");
}

async function ensureClientConnection() {
  // If we're already connecting/connected, wait for it
  if (connectionPromise) {
    await connectionPromise;
    return;
  }

  const pooledUrl = process.env.POSTGRES_URL;
  const directUrl = process.env.POSTGRES_URL_NON_POOLING;

  // If a pooled URL is provided, try using pooled client first.
  if (pooledUrl) {
    connectionPromise = (async () => {
      try {
        // Quick probe to verify if the pooled URL is actually pooled
        await pooledSql`SELECT 1;`;
        sql = pooledSql; // good to use pooled
      } catch (err) {
        // If the pooled URL is actually a direct (non-pooled) string, fall back to createClient
        if (isInvalidConnStringError(err)) {
          const client = createClient({ connectionString: pooledUrl });
          sql = client.sql;
          await client.connect();
        } else {
          throw err;
        }
      }
    })();
    await connectionPromise;
    return;
  }

  // Otherwise, if a non-pooled URL is provided, use a direct client
  if (directUrl) {
    connectionPromise = (async () => {
      const client = createClient({ connectionString: directUrl });
      sql = client.sql;
      await client.connect();
    })();
    await connectionPromise;
    return;
  }

  // No URLs provided — let ensureDatabase surface a clear error
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
