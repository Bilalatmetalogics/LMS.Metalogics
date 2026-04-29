import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Certificate from "@/models/Certificate";
import Notification from "@/models/Notification";
import { emitNotification } from "@/lib/socket";

// GET /api/certificates/[id] — get single certificate
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const cert = await Certificate.findById(id)
    .populate("userId", "name email")
    .populate("courseId", "title category")
    .populate("approvedBy", "name")
    .lean();

  if (!cert) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const role = (session.user as any).role;
  const userId = (session.user as any).id;

  // Students can only see their own
  if (role === "student" && (cert as any).userId._id.toString() !== userId)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  return NextResponse.json(cert);
}

// PATCH /api/certificates/[id] — admin approves, rejects, or edits display fields
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await auth();
  const role = (session?.user as any)?.role;

  if (!["admin", "instructor"].includes(role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { action, displayName, displayCourseTitle, displayDuration } = body;

  await connectDB();
  const adminId = (session!.user as any).id;

  // Build update object
  const update: any = {};

  // Apply display field edits regardless of action
  if (displayName !== undefined) update.displayName = displayName;
  if (displayCourseTitle !== undefined)
    update.displayCourseTitle = displayCourseTitle;
  if (displayDuration !== undefined) update.displayDuration = displayDuration;

  // Apply status change
  if (action === "approve") {
    update.status = "approved";
    update.approvedBy = adminId;
    update.issuedAt = new Date();
  } else if (action === "reject") {
    update.status = "rejected";
    update.approvedBy = adminId;
  } else if (action && !["approve", "reject"].includes(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const cert = await Certificate.findByIdAndUpdate(id, update, { new: true })
    .populate("userId", "name email")
    .populate("courseId", "title");

  if (!cert) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Notify the student on approval
  if (action === "approve") {
    const studentId = (cert.userId as any)._id.toString();
    const courseTitle = (cert.courseId as any).title;
    const notifPayload = {
      type: "certificate",
      message: `Your certificate for "${courseTitle}" has been approved. You can now download it.`,
      link: `/courses/${(cert.courseId as any)._id}/certificate`,
    };
    await Notification.create({ userId: studentId, ...notifPayload });
    emitNotification(studentId, notifPayload);
  }

  return NextResponse.json(cert);
}
