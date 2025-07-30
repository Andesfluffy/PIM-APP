import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Contact from "@/lib/models/Contact";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const contact = await Contact.findById(params.id);
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
    await connectToDatabase();
    const body = await req.json();
    const updated = await Contact.findByIdAndUpdate(
      params.id,
      { ...body, updatedAt: new Date() },
      {
        new: true,
        runValidators: true,
      }
    );
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
    await connectToDatabase();
    await Contact.findByIdAndDelete(params.id);
    return new Response(null, { status: 204 });
  } catch (err: any) {
    console.error("DELETE /api/contacts/[id] error", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
