import { NextRequest, NextResponse } from "next/server";
import { createTask, listTasks } from "@/lib/repositories/tasks";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const tasks = await listTasks(userId ?? undefined);
    return NextResponse.json(tasks);
  } catch (err: any) {
    console.error("GET /api/tasks error", err);
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
  try {
    const { userId, title, description, status, priority, dueDate } =
      await req.json();
    if (!userId || !title)
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const task = await createTask({
      userId,
      title,
      description,
      status,
      priority,
      dueDate,
    });
    return NextResponse.json(task, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/tasks error", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
