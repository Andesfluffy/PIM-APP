import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Contact from "@/lib/models/Contact";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const query = userId ? { userId } : {};
    const contacts = await Contact.find(query);
    return NextResponse.json(contacts);
  } catch (err: any) {
    console.error("GET /api/contacts error", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
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
  } catch (err: any) {
    console.error("POST /api/contacts error", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
