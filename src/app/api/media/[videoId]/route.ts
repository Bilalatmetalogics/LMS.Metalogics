import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { v2 as cloudinary } from "cloudinary";
import Course from "@/models/Course";
import User from "@/models/User";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Signed URL TTL in seconds (10 minutes)
const SIGNED_URL_TTL = 600;

/**
 * GET /api/media/[videoId]?courseId=xxx
 *
 * Verifies the authenticated user is assigned to the course,
 * then returns a short-lived signed Cloudinary URL for the asset.
 * Non-Cloudinary items (youtube, link) return the URL directly.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { videoId: string } },
) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("courseId");
  if (!courseId)
    return NextResponse.json({ error: "courseId required" }, { status: 400 });

  await connectDB();

  const userId = (session.user as any).id;
  const role = (session.user as any).role;

  // Students must be assigned to the course
  if (role === "student") {
    const user = await User.findById(userId, "assignedCourses").lean();
    const assigned = (user as any)?.assignedCourses?.map((id: any) =>
      id.toString(),
    );
    if (!assigned?.includes(courseId)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  // Find the content item across all modules
  const course = await Course.findById(courseId).lean();
  if (!course)
    return NextResponse.json({ error: "Course not found" }, { status: 404 });

  let foundItem: any = null;
  for (const mod of (course as any).modules) {
    for (const v of mod.videos) {
      if (v._id.toString() === params.videoId) {
        foundItem = v;
        break;
      }
    }
    if (foundItem) break;
  }

  if (!foundItem)
    return NextResponse.json({ error: "Item not found" }, { status: 404 });

  // Non-Cloudinary content — return URL directly (no signing needed)
  if (
    !foundItem.publicId ||
    foundItem.type === "youtube" ||
    foundItem.type === "link"
  ) {
    return NextResponse.json({ url: foundItem.url, signed: false });
  }

  // Generate a signed Cloudinary URL
  const resourceType = foundItem.type === "pdf" ? "raw" : "video";
  const expiresAt = Math.round(Date.now() / 1000) + SIGNED_URL_TTL;

  const signedUrl = cloudinary.url(foundItem.publicId, {
    resource_type: resourceType,
    type: "upload",
    sign_url: true,
    expires_at: expiresAt,
    secure: true,
  });

  return NextResponse.json({
    url: signedUrl,
    signed: true,
    expiresAt,
  });
}
