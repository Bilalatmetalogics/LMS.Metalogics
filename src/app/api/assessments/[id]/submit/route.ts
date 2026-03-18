import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Assessment from "@/models/Assessment";
import AssessmentResult from "@/models/AssessmentResult";
import Notification from "@/models/Notification";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  await connectDB();

  const { answers, courseId } = await req.json();
  // answers: [{ questionId, answer }]

  const assessment = (await Assessment.findById(params.id).lean()) as any;
  if (!assessment)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Auto-grade mcq and truefalse
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
    return { ...a, isCorrect: null }; // short answer — manual grading
  });

  const hasShort = assessment.questions.some((q: any) => q.type === "short");
  const score = autoTotal > 0 ? Math.round((autoCorrect / autoTotal) * 100) : 0;
  const passed = !hasShort && score >= assessment.passingScore;

  const result = await AssessmentResult.create({
    userId,
    assessmentId: params.id,
    courseId,
    answers: gradedAnswers,
    score,
    passed,
    gradedAt: hasShort ? undefined : new Date(),
  });

  if (!hasShort) {
    await Notification.create({
      userId,
      type: "grade",
      message: `Assessment graded: ${score}% — ${passed ? "Passed" : "Not passed"}`,
      link: `/courses/${courseId}`,
    });
  }

  return NextResponse.json(result, { status: 201 });
}
