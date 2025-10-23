import { ensureDatabase, sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await ensureDatabase();
    await sql`SELECT 1;`;
    return NextResponse.json({
      success: true,
      message: "✅ Connected to Vercel Postgres",
    });
  } catch (error: any) {
    console.error("❌ DB connection error:", error);

    return NextResponse.json({
      success: false,
      message: "Failed to connect",
      error: {
        name: error?.name,
        message: error?.message,
        stack: error?.stack,
      },
    });
  }
}
