import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Contact from "@/lib/models/Contact";

export async function GET(req: NextRequest) {
  await connectToDatabase();
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  const filter: Record<string, unknown> = {};
  if (userId) filter.userId = userId;

  const contacts = await Contact.find(filter);
  return NextResponse.json(contacts);
}
export async function POST(req: NextRequest) {
  await connectToDatabase();
  const { userId, name, email, phone } = await req.json();
  if (!userId || !name || !email)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const contact = await Contact.create({
    userId,
    name,
    email,
    phone,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return NextResponse.json(contact);
}
