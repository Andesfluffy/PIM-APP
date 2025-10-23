import { NextRequest, NextResponse } from "next/server";
import {
  deleteContact,
  findContact,
  updateContact as updateContactRecord,
} from "@/lib/repositories/contacts";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const contact = await findContact(params.id);
    if (!contact) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(contact);
  } catch (err: any) {
    console.error("GET /api/contacts/[id] error", err);
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
    const body = await req.json();
    const updated = await updateContactRecord(params.id, {
      name: body.name,
      email: body.email,
      phone: body.phone,
    });
    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("PUT /api/contacts/[id] error", err);
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
    await deleteContact(params.id);
    return new Response(null, { status: 204 });
  } catch (err: any) {
    console.error("DELETE /api/contacts/[id] error", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
