
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;
const DB_NAME = process.env.DATABASE_NAME || "pim-app";

export async function connectToDatabase() {
  if (mongoose.connection.readyState >= 1) return;

  return mongoose.connect(MONGODB_URI, {
    dbName: DB_NAME,
  });
}
