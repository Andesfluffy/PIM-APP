
import mongoose from "mongoose";

// Support both MONGODB_URI and COSMOS_DB_CONNECTION_STRING to
// match the configuration used in different environments.
const MONGODB_URI =
  (process.env.MONGODB_URI || process.env.COSMOS_DB_CONNECTION_STRING)!;

export async function connectToDatabase() {
  if (mongoose.connection.readyState >= 1) return;

  return mongoose.connect(MONGODB_URI, {
    dbName: "pim",
  });
}
