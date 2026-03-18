import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import UserProgress from "@/models/UserProgress";
import Course from "@/models/Course";
import Notification from "@/models/Notification";

const UNLOCK_THRESHOLD = 0.75;

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { videoId, courseId, watchedSeconds, totalSeconds } = await req.json();
  const userId = (session.user as any).id;

  await connectDB();

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
        await Notification.create({
          userId,
          type: "unlock",
          message: `Next video unlocked: "${nextVideoTitle}"`,
          link: `/courses/${courseId}/learn`,
        });
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
