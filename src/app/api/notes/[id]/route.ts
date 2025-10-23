import { NextRequest, NextResponse } from "next/server";
import {
  deleteNote,
  findNote,
  updateNote as updateNoteRecord,
} from "@/lib/repositories/notes";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const note = await findNote(params.id);
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
    const { title, content } = await req.json();
    const updated = await updateNoteRecord(params.id, { title, content });
    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
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
    await deleteNote(params.id);
    return new Response(null, { status: 204 });
  } catch (err: any) {
    console.error("DELETE /api/notes/[id] error", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
