import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Note from "@/lib/models/Note";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectToDatabase();
  const note = await Note.findById(params.id);
  if (!note) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(note);
}


export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectToDatabase();
  const { title, content } = await req.json();
  const updated = await Note.findByIdAndUpdate(
    params.id,
    { title, content, updatedAt: new Date() },
    { new: true, runValidators: true }
  );
  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectToDatabase();
  await Note.findByIdAndDelete(params.id);
  return new Response(null, { status: 204 });
}
