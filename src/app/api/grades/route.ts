import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import AssessmentResult from "@/models/AssessmentResult";
import Notification from "@/models/Notification";

// GET /api/grades?courseId=xxx — instructor grade book
export async function GET(req: NextRequest) {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!["admin", "instructor"].includes(role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  await connectDB();
  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("courseId");
  const results = await AssessmentResult.find({ courseId })
    .populate("userId", "name email")
    .populate("assessmentId", "title passingScore")
    .sort({ createdAt: -1 })
    .lean();
  return NextResponse.json(results);
}

// PATCH /api/grades/:id — manual grade short answers
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
    await Notification.create({
      userId: result.userId._id,
      type: "grade",
      message: `Your assessment has been graded: ${score}%`,
      link: `/courses/${result.courseId}`,
    });
  }
  return NextResponse.json(result);
}
