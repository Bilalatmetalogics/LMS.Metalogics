import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

// POST — assign/unassign users to a course
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!["admin", "instructor"].includes(role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  await connectDB();
  const { userIds, action } = await req.json(); // action: "assign" | "unassign"

  if (action === "assign") {
    await User.updateMany(
      { _id: { $in: userIds } },
      { $addToSet: { assignedCourses: params.id } },
    );
  } else {
    await User.updateMany(
      { _id: { $in: userIds } },
      { $pull: { assignedCourses: params.id } },
    );
  }
  return NextResponse.json({ success: true });
}

// GET — list users assigned to this course
export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!["admin", "instructor"].includes(role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  await connectDB();
  const assigned = await User.find(
    { assignedCourses: params.id, isActive: true },
    "-passwordHash",
  ).lean();
  const unassigned = await User.find(
    { assignedCourses: { $ne: params.id }, isActive: true, role: "student" },
    "-passwordHash",
  ).lean();
  return NextResponse.json({ assigned, unassigned });
}
