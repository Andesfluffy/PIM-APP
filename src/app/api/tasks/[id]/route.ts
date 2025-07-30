import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Task from "@/lib/models/Task";

export const dynamic = 'force-dynamic';

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
  } catch (error) {
    console.error(`GET /api/tasks/${context.params} error`, error);
    return NextResponse.json(
      { error: "Internal Server Error" },
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
  } catch (error) {
    console.error(`PUT /api/tasks/${context.params} error`, error);
    return NextResponse.json(
      { error: "Internal Server Error" },
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
  } catch (error) {
    console.error(`DELETE /api/tasks/${context.params} error`, error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
