import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { v2 as cloudinary } from "cloudinary";
import { uploadLimiter } from "@/lib/rateLimit";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// GET /api/upload?folder=lms/videos&resource_type=video
// Returns signed params for direct browser-to-Cloudinary upload.
//
// IMPORTANT: resource_type must NOT be included in the signature params —
// it is part of the upload URL path, not the signed string.
export async function GET(req: NextRequest) {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!["admin", "instructor"].includes(role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Rate limit uploads per user
  const userId = (session?.user as any)?.id;
  const limit = uploadLimiter(userId);
  if (!limit.success)
    return NextResponse.json(
      { error: "Upload limit reached. Try again later." },
      { status: 429 },
    );

  const { searchParams } = new URL(req.url);
  const resourceType = searchParams.get("resource_type") || "video";
  const defaultFolder =
    resourceType === "image"
      ? "lms/thumbnails"
      : resourceType === "raw"
        ? "lms/docs"
        : "lms/videos";
  const folder = searchParams.get("folder") || defaultFolder;

  const timestamp = Math.round(Date.now() / 1000);

  // Sign only folder + timestamp — resource_type is NOT part of the signed string
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    process.env.CLOUDINARY_API_SECRET!,
  );

  return NextResponse.json({
    signature,
    timestamp,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    folder,
    resourceType,
  });
}
