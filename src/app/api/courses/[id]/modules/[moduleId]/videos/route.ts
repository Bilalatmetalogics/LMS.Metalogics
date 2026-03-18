import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Course from "@/models/Course";

// POST — add a video to a module
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string; moduleId: string } },
) {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!["admin", "instructor"].includes(role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  await connectDB();
  const { title, url, duration, thumbnailUrl } = await req.json();
  const course = await Course.findById(params.id);
  if (!course)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  const mod = course.modules.id(params.moduleId);
  if (!mod)
    return NextResponse.json({ error: "Module not found" }, { status: 404 });
  const order = mod.videos.length + 1;
  mod.videos.push({
    title,
    url,
    duration: duration || 0,
    thumbnailUrl,
    order,
  } as any);
  await course.save();
  return NextResponse.json(course, { status: 201 });
}

// DELETE — remove a video
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
