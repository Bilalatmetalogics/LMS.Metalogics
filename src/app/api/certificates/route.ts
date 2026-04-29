import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Certificate from "@/models/Certificate";
import UserProgress from "@/models/UserProgress";
import Course from "@/models/Course";

// GET /api/certificates
// - Student: their own certificates
// - Admin/Instructor: all certificates (with user + course populated)
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const role = (session.user as any).role;
  const userId = (session.user as any).id;
  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("courseId");

  let query: any = {};
  if (role === "student") {
    query.userId = userId;
    if (courseId) query.courseId = courseId;
  } else {
    // admin / instructor see all
    if (courseId) query.courseId = courseId;
  }

  const certs = await Certificate.find(query)
    .populate("userId", "name email")
    .populate("courseId", "title")
    .populate("approvedBy", "name")
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json(certs);
}

// POST /api/certificates
// Called automatically when a student reaches 100% course completion.
// Idempotent — silently returns existing cert if already created.
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { courseId } = await req.json();
  if (!courseId)
    return NextResponse.json({ error: "courseId required" }, { status: 400 });

  await connectDB();
  const userId = (session.user as any).id;

  // Verify the student actually completed the course
  const course = (await Course.findById(courseId).lean()) as any;
  if (!course)
    return NextResponse.json({ error: "Course not found" }, { status: 404 });

  const allVideoIds = course.modules.flatMap((m: any) =>
    m.videos.map((v: any) => v._id.toString()),
  );

  if (allVideoIds.length === 0)
    return NextResponse.json(
      { error: "Course has no content" },
      { status: 400 },
    );

  const completedProgress = await UserProgress.find({
    userId,
    courseId,
    completed: true,
  }).lean();

  const completedIds = new Set(
    completedProgress.map((p: any) => p.videoId.toString()),
  );
  const allDone = allVideoIds.every((id: string) => completedIds.has(id));

  if (!allDone)
    return NextResponse.json(
      { error: "Course not yet completed" },
      { status: 400 },
    );

  // Upsert — don't create duplicates
  const cert = await Certificate.findOneAndUpdate(
    { userId, courseId },
    { userId, courseId },
    { upsert: true, new: true },
  );

  return NextResponse.json(cert, { status: 201 });
}
