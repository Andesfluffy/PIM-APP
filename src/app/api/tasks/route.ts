import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Task from "@/lib/models/Task";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    const filter: Record<string, unknown> = {};
    if (userId) filter.userId = userId;

    const tasks = await Task.find(filter);
    return NextResponse.json(tasks);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}
export async function POST(req: NextRequest) {
  try {
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
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to create task" },
      { status: 500 }
    );
  }
}
