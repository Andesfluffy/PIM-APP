import { NextRequest, NextResponse } from "next/server";
import { createContact, listContacts } from "@/lib/repositories/contacts";
import { verifyAuth, unauthorized } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { uid } = await verifyAuth(req);
    const contacts = await listContacts(uid);
    return NextResponse.json(contacts);
  } catch (err: any) {
    console.error("GET /api/contacts error", err);
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

//   const contacts = await Contact.find({ userId });
//   return NextResponse.json(contacts);
// }

// export async function POST(req: NextRequest) {
//   await connectToDatabase();
//   const body = await req.json();
//   const { userId, name, email, phone } = body;

//   const contact = await Contact.create({ userId, name, email, phone });
//   return NextResponse.json(contact, { status: 201 });
// }
export async function POST(req: NextRequest) {
  try {
    const { uid } = await verifyAuth(req);
    const { name, email, phone } = await req.json();
    if (!name || !email)
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const contact = await createContact({
      userId: uid,
      name,
      email,
      phone,
    });
    return NextResponse.json(contact, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/contacts error", err);
    if (err?.message === "UNAUTHORIZED") return unauthorized();
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
export const runtime = "nodejs";
