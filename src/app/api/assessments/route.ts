import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Assessment from "@/models/Assessment";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("courseId");
  const query = courseId ? { courseId } : {};
  const assessments = await Assessment.find(query).lean();
  return NextResponse.json(assessments);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!["admin", "instructor"].includes(role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  await connectDB();
  const body = await req.json();
  const assessment = await Assessment.create(body);
  return NextResponse.json(assessment, { status: 201 });
}
