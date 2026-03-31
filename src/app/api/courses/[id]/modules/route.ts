import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Course from "@/models/Course";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!["admin", "instructor"].includes(role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  await connectDB();
  const { title } = await req.json();
  const course = await Course.findById(id);
  if (!course)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  const order = course.modules.length + 1;
  course.modules.push({ title, order, videos: [] } as any);
  await course.save();
  return NextResponse.json(course, { status: 201 });
}
