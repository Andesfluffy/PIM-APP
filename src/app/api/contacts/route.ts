import { NextRequest, NextResponse } from "next/server";
import { createContact, listContacts } from "@/lib/repositories/contacts";
import {
  isValidEmail,
  isValidPhone,
  sanitizeContactInput,
} from "@/lib/validation/contact";
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
    const sanitized = sanitizeContactInput({ name, email, phone });

    if (!sanitized.name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const hasEmail = Boolean(sanitized.email);
    const hasPhone = Boolean(sanitized.phone);

    if (!hasEmail && !hasPhone) {
      return NextResponse.json(
        { error: "Provide an email address or phone number" },
        { status: 400 }
      );
    }

    if (hasEmail && !isValidEmail(sanitized.email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    if (hasPhone && !isValidPhone(sanitized.phone)) {
      return NextResponse.json({ error: "Invalid phone" }, { status: 400 });
    }

    const contact = await createContact({
      userId: uid,
      name: sanitized.name,
      email: hasEmail ? sanitized.email : null,
      phone: hasPhone ? sanitized.phone : null,
    });
    return NextResponse.json(contact, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/contacts error", err);
    if (err?.message === "UNAUTHORIZED") return unauthorized();
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
export const runtime = "nodejs";
