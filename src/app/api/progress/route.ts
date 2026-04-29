import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import UserProgress from "@/models/UserProgress";
import Course from "@/models/Course";
import User from "@/models/User";
import Notification from "@/models/Notification";
import Certificate from "@/models/Certificate";
import { emitNotification } from "@/lib/socket";
import { progressLimiter } from "@/lib/rateLimit";

const UNLOCK_THRESHOLD = 0.75;

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;

  // Rate limit progress updates (video heartbeat — 120/min is generous)
  const limit = progressLimiter(userId);
  if (!limit.success)
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });

  const { videoId, courseId, watchedSeconds, totalSeconds } = await req.json();
  const role = (session.user as any).role;

  await connectDB();

  // Students must be enrolled in the course
  if (role === "student") {
    const user = await User.findById(userId, "assignedCourses").lean();
    const enrolled = (user as any)?.assignedCourses?.map((id: any) =>
      id.toString(),
    );
    if (!enrolled?.includes(courseId))
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const ratio = totalSeconds > 0 ? watchedSeconds / totalSeconds : 0;
  const completed = ratio >= UNLOCK_THRESHOLD;

  // Upsert progress — never decrease watchedSeconds
  const existing = await UserProgress.findOne({ userId, videoId });
  const newWatched = existing
    ? Math.max(existing.watchedSeconds, watchedSeconds)
    : watchedSeconds;

  const progress = await UserProgress.findOneAndUpdate(
    { userId, videoId },
    {
      userId,
      courseId,
      videoId,
      watchedSeconds: newWatched,
      totalSeconds,
      completed: existing?.completed || completed,
      lastUpdated: new Date(),
    },
    { upsert: true, new: true },
  );

  // If just completed, check if next video should be unlocked
  if (completed && !existing?.completed) {
    const course = (await Course.findById(courseId).lean()) as any;
    if (course) {
      // Find next video across modules
      let found = false;
      let nextVideoTitle = "";
      outer: for (const mod of course.modules) {
        for (let i = 0; i < mod.videos.length; i++) {
          if (mod.videos[i]._id.toString() === videoId) {
            const nextVideo = mod.videos[i + 1];
            if (nextVideo) {
              nextVideoTitle = nextVideo.title;
              found = true;
            }
            break outer;
          }
        }
      }
      if (found) {
        const notifPayload = {
          type: "unlock",
          message: `Next video unlocked: "${nextVideoTitle}"`,
          link: `/courses/${courseId}/learn`,
        };
        await Notification.create({ userId, ...notifPayload });
        emitNotification(userId, notifPayload);
      }

      // Check if the entire course is now complete
      const allVideoIds = course.modules.flatMap((m: any) =>
        m.videos.map((v: any) => v._id.toString()),
      );
      if (allVideoIds.length > 0) {
        const completedCount = await UserProgress.countDocuments({
          userId,
          courseId,
          completed: true,
        });
        if (completedCount >= allVideoIds.length) {
          // Auto-create certificate request (idempotent)
          const existing = await Certificate.findOne({ userId, courseId });
          if (!existing) {
            await Certificate.create({ userId, courseId, status: "pending" });
            const notifPayload = {
              type: "certificate",
              message: `You've completed "${course.title}"! Your certificate request has been submitted for admin approval.`,
              link: `/courses/${courseId}/certificate`,
            };
            await Notification.create({ userId, ...notifPayload });
            emitNotification(userId, notifPayload);
          }
        }
      }
    }
  }

  return NextResponse.json({ progress, unlocked: completed });
}

// GET progress for a user in a course
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("courseId");
  const userId = (session.user as any).id;
  await connectDB();
  const progress = await UserProgress.find({ userId, courseId }).lean();
  return NextResponse.json(progress);
}
