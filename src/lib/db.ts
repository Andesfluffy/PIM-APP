import mongoose from "mongoose";

type MongooseConnection = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

// Allow using either MONGODB_URI or COSMOS_DB_CONNECTION_STRING
// so the API works in different deployment environments.
const MONGODB_URI =
  (process.env.MONGODB_URI || process.env.COSMOS_DB_CONNECTION_STRING) as
    | string
    | undefined;
const globalWithMongoose = global as unknown as { mongoose?: MongooseConnection };

const cached: MongooseConnection =
  globalWithMongoose.mongoose || { conn: null, promise: null };

export async function connectToDatabase() {
  if (!MONGODB_URI) {
    throw new Error("Missing MONGODB_URI in environment.");
  }
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        dbName: "pim-app",
        bufferCommands: false,
      })
      .then((mongoose) => mongoose);
  }

  cached.conn = await cached.promise;
  globalWithMongoose.mongoose = cached;
  return cached.conn;
}
