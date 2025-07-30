import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Note from "@/lib/models/Note";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const note = await Note.findById(params.id);
    if (!note) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(note);
  } catch (err: any) {
    console.error("GET /api/notes/[id] error", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const { title, content } = await req.json();
    const updated = await Note.findByIdAndUpdate(
      params.id,
      { title, content, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("PUT /api/notes/[id] error", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    await Note.findByIdAndDelete(params.id);
    return new Response(null, { status: 204 });
  } catch (err: any) {
    console.error("DELETE /api/notes/[id] error", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
