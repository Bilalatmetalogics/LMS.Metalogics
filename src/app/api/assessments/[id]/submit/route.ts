import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Assessment from "@/models/Assessment";
import AssessmentResult from "@/models/AssessmentResult";
import Notification from "@/models/Notification";
import { emitNotification } from "@/lib/socket";
import { submitLimiter } from "@/lib/rateLimit";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;

  // Rate limit assessment submissions
  const limit = submitLimiter(userId);
  if (!limit.success)
    return NextResponse.json(
      { error: "Too many submissions. Please wait before trying again." },
      { status: 429 },
    );
  await connectDB();

  const { answers, courseId } = await req.json();

  const assessment = (await Assessment.findById(id).lean()) as any;
  if (!assessment)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  let autoCorrect = 0;
  let autoTotal = 0;
  const gradedAnswers = answers.map((a: any) => {
    const question = assessment.questions.find(
      (q: any) => q._id.toString() === a.questionId,
    );
    if (!question) return a;
    if (question.type === "mcq" || question.type === "truefalse") {
      autoTotal++;
      const correct =
        question.correctAnswer?.toLowerCase() === a.answer?.toLowerCase();
      if (correct) autoCorrect++;
      return { ...a, isCorrect: correct };
    }
    return { ...a, isCorrect: null };
  });

  const hasShort = assessment.questions.some((q: any) => q.type === "short");
  const score = autoTotal > 0 ? Math.round((autoCorrect / autoTotal) * 100) : 0;
  const passed = !hasShort && score >= assessment.passingScore;

  const result = await AssessmentResult.create({
    userId,
    assessmentId: id,
    courseId,
    answers: gradedAnswers,
    score,
    passed,
    gradedAt: hasShort ? undefined : new Date(),
  });

  if (!hasShort) {
    const notifPayload = {
      type: "grade",
      message: `Assessment graded: ${score}% — ${passed ? "Passed" : "Not passed"}`,
      link: `/courses/${courseId}`,
    };
    await Notification.create({ userId, ...notifPayload });
    emitNotification(userId, notifPayload);
  }

  return NextResponse.json(result, { status: 201 });
}
