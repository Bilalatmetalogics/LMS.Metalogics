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

const SIGNED_URL_TTL = 600; // 10 minutes

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ videoId: string }> },
) {
  const { videoId } = await params;
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

  if (role === "student") {
    const user = await User.findById(userId, "assignedCourses").lean();
    const assigned = (user as any)?.assignedCourses?.map((id: any) =>
      id.toString(),
    );
    if (!assigned?.includes(courseId))
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const course = await Course.findById(courseId).lean();
  if (!course)
    return NextResponse.json({ error: "Course not found" }, { status: 404 });

  let foundItem: any = null;
  for (const mod of (course as any).modules) {
    for (const v of mod.videos) {
      if (v._id.toString() === videoId) {
        foundItem = v;
        break;
      }
    }
    if (foundItem) break;
  }

  if (!foundItem)
    return NextResponse.json({ error: "Item not found" }, { status: 404 });

  // Non-Cloudinary or non-signable types — return URL directly
  if (
    !foundItem.publicId ||
    foundItem.type === "youtube" ||
    foundItem.type === "link"
  ) {
    return NextResponse.json({ url: foundItem.url, signed: false });
  }

  const resourceType = foundItem.type === "pdf" ? "raw" : "video";
  const expiresAt = Math.round(Date.now() / 1000) + SIGNED_URL_TTL;

  const signedUrl = cloudinary.url(foundItem.publicId, {
    resource_type: resourceType,
    type: "upload",
    sign_url: true,
    expires_at: expiresAt,
    secure: true,
  });

  return NextResponse.json({ url: signedUrl, signed: true, expiresAt });
}
