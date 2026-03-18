import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Course from "@/models/Course";
import User from "@/models/User";

export async function GET() {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const role = (session.user as any).role;
  const userId = (session.user as any).id;

  if (role === "admin") {
    const courses = await Course.find()
      .populate("createdBy", "name email")
      .lean();
    return NextResponse.json(courses);
  }
  if (role === "instructor") {
    const courses = await Course.find({ createdBy: userId }).lean();
    return NextResponse.json(courses);
  }
  // student — only assigned courses
  const user = await User.findById(userId).lean();
  const courses = await Course.find({
    _id: { $in: (user as any).assignedCourses },
    status: "published",
  }).lean();
  return NextResponse.json(courses);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!["admin", "instructor"].includes(role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  await connectDB();
  const body = await req.json();
  const course = await Course.create({
    ...body,
    createdBy: (session!.user as any).id,
  });
  return NextResponse.json(course, { status: 201 });
}
