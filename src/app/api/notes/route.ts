import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Note from "@/lib/models/Note";

export async function GET(req: NextRequest) {
  await connectToDatabase();
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  const filter: Record<string, unknown> = {};
  if (userId) filter.userId = userId;

  const notes = await Note.find(filter);
  return NextResponse.json(notes);
}

export async function POST(req: NextRequest) {
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
}
