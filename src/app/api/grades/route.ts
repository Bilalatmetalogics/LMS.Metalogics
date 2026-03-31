import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import AssessmentResult from "@/models/AssessmentResult";
import Notification from "@/models/Notification";
import { emitNotification } from "@/lib/socket";

// GET /api/grades?courseId=xxx
// Admin/Instructor: full grade book for a course
// Student: their own results (optionally filtered by courseId)
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("courseId");
  const role = (session.user as any).role;
  const userId = (session.user as any).id;

  if (role === "student") {
    // Students only see their own results
    const query: any = { userId };
    if (courseId) query.courseId = courseId;
    const results = await AssessmentResult.find(query)
      .populate("assessmentId", "title passingScore")
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json(results);
  }

  // Admin / Instructor — full grade book
  if (!["admin", "instructor"].includes(role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const query: any = {};
  if (courseId) query.courseId = courseId;

  const results = await AssessmentResult.find(query)
    .populate("userId", "name email")
    .populate("assessmentId", "title passingScore")
    .sort({ createdAt: -1 })
    .lean();
  return NextResponse.json(results);
}

// PATCH /api/grades — manual grade short answers (instructor/admin only)
export async function PATCH(req: NextRequest) {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!["admin", "instructor"].includes(role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  await connectDB();
  const { resultId, answers, score } = await req.json();
  const result = (await AssessmentResult.findByIdAndUpdate(
    resultId,
    { answers, score, passed: score >= 70, gradedAt: new Date() },
    { new: true },
  ).populate("userId", "_id")) as any;

  if (result) {
    const notifPayload = {
      type: "grade",
      message: `Your assessment has been graded: ${score}%`,
      link: `/courses/${result.courseId}`,
    };
    await Notification.create({ userId: result.userId._id, ...notifPayload });
    emitNotification(result.userId._id.toString(), notifPayload);
  }
  return NextResponse.json(result);
}
