import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Notification from "@/models/Notification";

export async function GET() {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const notifications = await Notification.find({
    userId: (session.user as any).id,
  })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();
  return NextResponse.json(notifications);
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const { ids } = await req.json(); // array of notification ids to mark read
  await Notification.updateMany(
    { _id: { $in: ids }, userId: (session.user as any).id },
    { read: true },
  );
  return NextResponse.json({ success: true });
}
