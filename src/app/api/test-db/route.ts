import { connectToDatabase } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectToDatabase();
    return NextResponse.json({
      success: true,
      message: "✅ Connected to Cosmos DB",
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
