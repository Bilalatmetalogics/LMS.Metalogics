import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Course from "@/models/Course";

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const course = (await Course.findById(id)
    .populate("createdBy", "name email")
    .lean()) as any;
  if (!course)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!course.modules) course.modules = [];
  return NextResponse.json(course);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await auth();
  const role = (session?.user as any)?.role;
  const userId = (session?.user as any)?.id;
  if (!["admin", "instructor"].includes(role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  await connectDB();
  const course = await Course.findById(id);
  if (!course)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  // Instructors can only edit their own courses
  if (role === "instructor" && course.createdBy.toString() !== userId)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json();
  Object.assign(course, body);
  await course.save();
  return NextResponse.json(course);
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await auth();
  if ((session?.user as any)?.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  await connectDB();
  await Course.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
