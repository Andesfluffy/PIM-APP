import {
  createClient,
  createPool,
  sql as pooledSql,
} from "@vercel/postgres";
import type { VercelClient, VercelPool } from "@vercel/postgres";

type SqlExecutor = typeof pooledSql;

let sql: SqlExecutor = pooledSql;
let initialized = false;
let connectionPromise: Promise<void> | null = null;
let activeClient: VercelClient | null = null;
let activePool: VercelPool | null = null;

// Errors that indicate the connection is gone and should be re-established.
const RETRYABLE_ERROR_CODES = new Set([
  "57P01", // admin_shutdown
  "57P02", // crash_shutdown
  "57P03", // cannot_connect_now
  "08003", // connection_does_not_exist
  "08006", // connection_failure
  "ECONNRESET",
  "ECONNREFUSED",
]);

async function closeActiveHandles() {
  const tasks: Promise<unknown>[] = [];
  if (activeClient) {
    const client = activeClient;
    activeClient = null;
    tasks.push(client.end().catch(() => undefined));
  }
  if (activePool) {
    const pool = activePool;
    activePool = null;
    tasks.push(pool.end().catch(() => undefined));
  }
  if (tasks.length) {
    await Promise.all(tasks);
  }
}

async function resetConnectionState() {
  await closeActiveHandles();
  connectionPromise = null;
  initialized = false;
  sql = pooledSql;
}

function shouldResetForError(err: unknown) {
  const error = err as any;
  const code = error?.code;
  if (typeof code === "string" && RETRYABLE_ERROR_CODES.has(code)) {
    return true;
  }
  const message =
    typeof error?.message === "string" ? error.message : String(error ?? "");
  return (
    message.includes("Connection terminated unexpectedly") ||
    message.includes("Client has encountered a connection error") ||
    message.includes("socket hang up") ||
    message.includes("The connection was closed")
  );
}

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

  const pooledUrl =
    process.env.POSTGRES_URL || process.env.VERCEL_POSTGRES_URL || null;
  const directUrl =
    process.env.POSTGRES_URL_NON_POOLING || process.env.DATABASE_URL || null;

  const connectWithDirect = async (url: string) => {
    await closeActiveHandles();
    const client = createClient({ connectionString: url });
    await client.connect();
    activeClient = client;
    sql = ((strings, ...values) => client.sql(strings, ...values)) as SqlExecutor;
  };

  connectionPromise = (async () => {
    if (pooledUrl) {
      try {
        await closeActiveHandles();
        const pool = createPool({ connectionString: pooledUrl });
        try {
          await pool.sql`SELECT 1;`;
        } catch (err) {
          await pool.end().catch(() => undefined);
          throw err;
        }
        activePool = pool;
        sql = ((strings, ...values) =>
          pool.sql(strings, ...values)) as SqlExecutor;
        return;
      } catch (err) {
        if (!isInvalidConnStringError(err)) {
          throw err;
        }
        const fallbackUrl = directUrl ?? pooledUrl;
        await connectWithDirect(fallbackUrl);
        return;
      }
    }

    if (directUrl) {
      await connectWithDirect(directUrl);
      return;
    }

    // No URLs provided — let ensureDatabase surface a clear error
  })();

  try {
    await connectionPromise;
  } catch (err) {
    await resetConnectionState();
    throw err;
  }
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
      email TEXT,
      phone TEXT,
      created_at TIMESTAMPTZ NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL
    );
  `;

  await sql`
    ALTER TABLE contacts
    ALTER COLUMN email DROP NOT NULL;
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
  if (
    !process.env.POSTGRES_URL &&
    !process.env.POSTGRES_URL_NON_POOLING &&
    !process.env.VERCEL_POSTGRES_URL &&
    !process.env.DATABASE_URL
  ) {
    throw new Error(
      "Missing Postgres connection string. Set POSTGRES_URL, POSTGRES_URL_NON_POOLING, VERCEL_POSTGRES_URL, or DATABASE_URL in .env.local."
    );
  }
  try {
    await ensureClientConnection();
  } catch (err) {
    // Allow retries if the first connection attempt fails (e.g. DB starts slowly)
    await resetConnectionState();
    throw err;
  }

  if (!initialized) {
    await createTables();
    initialized = true;
    return;
  }

  // For direct connections, proactively ensure the connection is still alive.
  if (activeClient) {
    try {
      await sql`SELECT 1;`;
    } catch (err) {
      if (!shouldResetForError(err)) {
        throw err;
      }
      await resetConnectionState();
      await ensureDatabase();
    }
  }
}

export { sql };
