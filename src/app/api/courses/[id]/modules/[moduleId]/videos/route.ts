import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Course from "@/models/Course";

/**
 * Extract Cloudinary public_id from a secure_url.
 * e.g. https://res.cloudinary.com/<cloud>/video/upload/v123/lms/videos/abc.mp4
 *   → lms/videos/abc
 */
function extractPublicId(url: string): string | undefined {
  try {
    const match = url.match(
      /cloudinary\.com\/[^/]+\/(?:video|image|raw)\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/,
    );
    return match?.[1];
  } catch {
    return undefined;
  }
}

// POST — add a content item to a module
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string; moduleId: string } },
) {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!["admin", "instructor"].includes(role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  await connectDB();

  const { title, url, duration, type, description, thumbnailUrl } =
    await req.json();

  const course = await Course.findById(params.id);
  if (!course)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  const mod = course.modules.id(params.moduleId);
  if (!mod)
    return NextResponse.json({ error: "Module not found" }, { status: 404 });

  const order = mod.videos.length + 1;
  // Only extract publicId for uploaded Cloudinary assets (video/pdf)
  const publicId =
    (type === "video" || type === "pdf") && url.includes("cloudinary.com")
      ? extractPublicId(url)
      : undefined;

  mod.videos.push({
    title,
    url,
    publicId,
    type: type || "video",
    duration: duration || 0,
    description,
    thumbnailUrl,
    order,
  } as any);

  await course.save();
  return NextResponse.json(course, { status: 201 });
}

// DELETE — remove a content item
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; moduleId: string } },
) {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!["admin", "instructor"].includes(role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  await connectDB();

  const { videoId } = await req.json();
  const course = await Course.findById(params.id);
  if (!course)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  const mod = course.modules.id(params.moduleId);
  if (!mod)
    return NextResponse.json({ error: "Module not found" }, { status: 404 });

  mod.videos = mod.videos.filter(
    (v: any) => v._id.toString() !== videoId,
  ) as any;
  await course.save();
  return NextResponse.json(course);
}
