import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Note from "@/lib/models/Note";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    const filter: Record<string, unknown> = {};
    if (userId) filter.userId = userId;

    const notes = await Note.find(filter);
    return NextResponse.json(notes);
  } catch (error) {
    console.error("GET /api/notes error", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const { userId, title, content } = await req.json();
    if (!userId || !title || !content)
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const note = await Note.create({
      userId,
      title,
      content,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return NextResponse.json(note);
  } catch (error) {
    console.error("POST /api/notes error", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
