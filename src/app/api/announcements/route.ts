import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Announcement from "@/models/Announcement";
import Notification from "@/models/Notification";
import User from "@/models/User";
import { emitNotificationToMany } from "@/lib/socket";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("courseId");
  const query = courseId ? { courseId } : {};
  const announcements = await Announcement.find(query)
    .populate("createdBy", "name")
    .sort({ createdAt: -1 })
    .lean();
  return NextResponse.json(announcements);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!["admin", "instructor"].includes(role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  await connectDB();
  const { title, body, courseId } = await req.json();
  const announcement = await Announcement.create({
    title,
    body,
    courseId: courseId || null,
    createdBy: (session!.user as any).id,
  });

  // Notify relevant users
  let userIds: string[] = [];
  if (courseId) {
    const users = await User.find(
      { assignedCourses: courseId, isActive: true },
      "_id",
    ).lean();
    userIds = users.map((u: any) => u._id.toString());
  } else {
    const users = await User.find({ isActive: true }, "_id").lean();
    userIds = users.map((u: any) => u._id.toString());
  }

  await Notification.insertMany(
    userIds.map((uid) => ({
      userId: uid,
      type: "announcement",
      message: `New announcement: ${title}`,
      link: courseId ? `/courses/${courseId}` : "/dashboard",
    })),
  );

  // Push real-time event to all affected users
  emitNotificationToMany(userIds, {
    type: "announcement",
    message: `New announcement: ${title}`,
    link: courseId ? `/courses/${courseId}` : "/dashboard",
  });

  return NextResponse.json(announcement, { status: 201 });
}
