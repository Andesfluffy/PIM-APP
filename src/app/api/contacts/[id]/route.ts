import { NextRequest, NextResponse } from "next/server";
import { deleteContact, findContact, updateContact as updateContactRecord } from "@/lib/repositories/contacts";
import { verifyAuth } from "@/lib/auth";
import { isValidEmail, isValidPhone, sanitizeContactInput } from "@/lib/validation/contact";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { uid } = await verifyAuth(req);
    const { id } = await params;
    const contact = await findContact(id, uid);
    if (!contact) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(contact);
  } catch (err: any) {
    console.error("GET /api/contacts/[id] error", err);
    if (err?.message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { uid } = await verifyAuth(req);
    const body = await req.json();
    const hasName = Object.prototype.hasOwnProperty.call(body, "name");
    const hasEmail = Object.prototype.hasOwnProperty.call(body, "email");
    const hasPhone = Object.prototype.hasOwnProperty.call(body, "phone");
    const sanitized = sanitizeContactInput(body);

    if (hasName && !sanitized.name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    if (hasEmail && !sanitized.email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    if (sanitized.email && !isValidEmail(sanitized.email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    if (hasPhone && !isValidPhone(sanitized.phone)) {
      return NextResponse.json({ error: "Invalid phone" }, { status: 400 });
    }

    const { id } = await params;
    const updated = await updateContactRecord(id, {
      name: sanitized.name || undefined,
      email: sanitized.email || undefined,
      phone: hasPhone ? (sanitized.phone ? sanitized.phone : null) : undefined,
    }, uid);
    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("PUT /api/contacts/[id] error", err);
    if (err?.message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { uid } = await verifyAuth(req);
    const { id } = await params;
    await deleteContact(id, uid);
    return new Response(null, { status: 204 });
  } catch (err: any) {
    console.error("DELETE /api/contacts/[id] error", err);
    if (err?.message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
export const runtime = "nodejs";
