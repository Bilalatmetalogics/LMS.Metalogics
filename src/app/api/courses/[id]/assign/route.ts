import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Course from "@/models/Course";
import Notification from "@/models/Notification";
import { emitNotification } from "@/lib/socket";

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

  const { userIds, action } = await req.json();

  if (action === "assign") {
    await User.updateMany(
      { _id: { $in: userIds } },
      { $addToSet: { assignedCourses: id } },
    );

    // Notify each newly assigned student
    const course = (await Course.findById(id, "title").lean()) as any;
    const courseTitle = course?.title || "a course";

    await Promise.all(
      userIds.map(async (uid: string) => {
        const payload = {
          type: "assignment",
          message: `You've been enrolled in "${courseTitle}"`,
          link: `/courses/${id}`,
        };
        await Notification.create({ userId: uid, ...payload });
        emitNotification(uid, payload);
      }),
    );
  } else {
    await User.updateMany(
      { _id: { $in: userIds } },
      { $pull: { assignedCourses: id } },
    );
  }

  return NextResponse.json({ success: true });
}

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!["admin", "instructor"].includes(role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  await connectDB();
  const assigned = await User.find(
    { assignedCourses: id, isActive: true },
    "-passwordHash",
  ).lean();
  const unassigned = await User.find(
    { assignedCourses: { $ne: id }, isActive: true, role: "student" },
    "-passwordHash",
  ).lean();
  return NextResponse.json({ assigned, unassigned });
}
