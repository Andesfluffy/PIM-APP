import { NextRequest, NextResponse } from "next/server";
import { createNote, listNotes } from "@/lib/repositories/notes";
import { verifyAuth, unauthorized } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { uid } = await verifyAuth(req);
    const notes = await listNotes(uid);
    return NextResponse.json(notes);
  } catch (err: any) {
    console.error("GET /api/notes error", err);
    if (err?.message === "UNAUTHORIZED") return unauthorized();
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// export async function GET(req: NextRequest) {
//   await connectToDatabase();
//   const { searchParams } = new URL(req.url);
//   const userId = searchParams.get("userId");
//   if (!userId)
//     return NextResponse.json({ error: "Missing userId" }, { status: 400 });

//   const notes = await Note.find({ userId });
//   return NextResponse.json(notes);
// }

// export async function POST(req: NextRequest) {
//   await connectToDatabase();
//   const body = await req.json();
//   const { userId, text } = body;

//   const note = await Note.create({ userId, text });
//   return NextResponse.json(note, { status: 201 });
// }

export async function POST(req: NextRequest) {
  try {
    const { uid } = await verifyAuth(req);
    const { title, content } = await req.json();
    if (!title || !content)
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const note = await createNote({
      userId: uid,
      title,
      content,
    });
    return NextResponse.json(note, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/notes error", err);
    if (err?.message === "UNAUTHORIZED") return unauthorized();
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
