import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Task from "@/lib/models/Task";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await connectToDatabase();
    const task = await Task.findById(id);
    if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(task);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch task" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await connectToDatabase();
    const body = await req.json();
    const updated = await Task.findByIdAndUpdate(
      id,
      {
        title: body.title,
        dueDate: body.dueDate,
        status: body.status,
      },
      { new: true }
    );

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to update task" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await connectToDatabase();
    await Task.findByIdAndDelete(id);
    return new Response(null, { status: 204 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to delete task" },
      { status: 500 }
    );
  }
}
