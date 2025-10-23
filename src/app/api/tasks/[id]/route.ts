import { NextRequest, NextResponse } from "next/server";
import {
  deleteTask,
  findTask,
  updateTask as updateTaskRecord,
} from "@/lib/repositories/tasks";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const task = await findTask(params.id);
    if (!task) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(task);
  } catch (err: any) {
    console.error("GET /api/tasks/[id] error", err);
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
    const updated = await updateTaskRecord(params.id, {
      title: body.title,
      description: body.description,
      status: body.status,
      priority: body.priority,
      dueDate: body.dueDate,
    });
    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("PUT /api/tasks/[id] error", err);
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
    await deleteTask(params.id);
    return new Response(null, { status: 204 });
  } catch (err: any) {
    console.error("DELETE /api/tasks/[id] error", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
