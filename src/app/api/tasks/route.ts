import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Task from "@/lib/models/Task";

export async function GET(req: NextRequest) {
  await connectToDatabase();
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const query = userId ? { userId } : {};
  const tasks = await Task.find(query);
  return NextResponse.json(tasks);
}

// export async function GET(req: NextRequest) {
//   await connectToDatabase();
//   const { searchParams } = new URL(req.url);
//   const userId = searchParams.get("userId");
//   if (!userId)
//     return NextResponse.json({ error: "Missing userId" }, { status: 400 });

//   const tasks = await Task.find({ userId });
//   return NextResponse.json(tasks);
// }

// export async function POST(req: NextRequest) {
//   await connectToDatabase();
//   const body = await req.json();
//   const { userId, title, dueDate, status } = body;

//   const task = await Task.create({ userId, title, dueDate, status });
//   return NextResponse.json(task, { status: 201 });
// }
export async function POST(req: NextRequest) {
  await connectToDatabase();
  const { userId, title, description, status, priority, dueDate } =
    await req.json();
  if (!userId || !title)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const task = await Task.create({
    userId,
    title,
    description,
    status: status || "pending",
    priority: priority || "medium",
    dueDate,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return NextResponse.json(task);
}
