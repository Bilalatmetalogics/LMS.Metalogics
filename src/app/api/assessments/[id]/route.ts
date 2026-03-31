import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Assessment from "@/models/Assessment";

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const assessment = (await Assessment.findById(id).lean()) as any;
  if (!assessment)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Strip correct answers for students — they should not see them before submitting
  const role = (session.user as any).role;
  if (role === "student") {
    assessment.questions = assessment.questions.map((q: any) => {
      const { correctAnswer, ...rest } = q;
      void correctAnswer; // intentionally omitted
      return rest;
    });
  }

  return NextResponse.json(assessment);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!["admin", "instructor"].includes(role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  await connectDB();
  const body = await req.json();
  const assessment = await Assessment.findByIdAndUpdate(id, body, {
    new: true,
  });
  return NextResponse.json(assessment);
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!["admin", "instructor"].includes(role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  await connectDB();
  await Assessment.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
