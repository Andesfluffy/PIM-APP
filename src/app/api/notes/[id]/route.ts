import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Note from "@/lib/models/Note";

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await connectToDatabase();
    const note = await Note.findById(id);
    if (!note)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(note);
  } catch (error) {
    console.error(`GET /api/notes/${context.params} error`, error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await connectToDatabase();
    const { title, content } = await req.json();
    const updated = await Note.findByIdAndUpdate(
      id,
      { title, content, updatedAt: new Date() },
      { new: true }
    );
    return NextResponse.json(updated);
  } catch (error) {
    console.error(`PUT /api/notes/${context.params} error`, error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await connectToDatabase();
    await Note.findByIdAndDelete(id);
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error(`DELETE /api/notes/${context.params} error`, error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
