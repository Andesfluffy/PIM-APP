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
  } catch (error) {
    console.error("GET /api/tasks error", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
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
  } catch (error) {
    console.error("POST /api/tasks error", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
