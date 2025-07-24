import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Task from "@/lib/models/Task";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectToDatabase();
  const body = await req.json();
  const updated = await Task.findByIdAndUpdate(
    params.id,
    {
      title: body.title,
      dueDate: body.dueDate,
      status: body.status,
    },
    { new: true }
  );

  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectToDatabase();
  await Task.findByIdAndDelete(params.id);
  return new Response(null, { status: 204 });
}
