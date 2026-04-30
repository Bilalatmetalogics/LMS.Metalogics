import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// GET /api/users/me — get own profile
export async function GET() {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const user = await User.findById(
    (session.user as any).id,
    "-passwordHash",
  ).lean();
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(user);
}

// PATCH /api/users/me — update own name and/or avatar
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const userId = (session.user as any).id;

  const contentType = req.headers.get("content-type") || "";

  let name: string | undefined;
  let avatarUrl: string | undefined;

  if (contentType.includes("multipart/form-data")) {
    // Avatar upload — parse form data
    const formData = await req.formData();
    const nameField = formData.get("name");
    const file = formData.get("avatar") as File | null;

    if (nameField) name = nameField.toString().trim();

    if (file && file.size > 0) {
      // Upload to Cloudinary as image
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const uploadResult = await new Promise<any>((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: "lms/avatars",
              transformation: [
                { width: 200, height: 200, crop: "fill", gravity: "face" },
              ],
              resource_type: "image",
            },
            (err, result) => {
              if (err) reject(err);
              else resolve(result);
            },
          )
          .end(buffer);
      });

      avatarUrl = uploadResult.secure_url;
    }
  } else {
    // JSON body — name only
    const body = await req.json();
    if (body.name) name = body.name.trim();
  }

  const update: any = {};
  if (name) update.name = name;
  if (avatarUrl) update.avatarUrl = avatarUrl;

  if (Object.keys(update).length === 0)
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });

  const user = await User.findByIdAndUpdate(userId, update, {
    new: true,
    select: "-passwordHash",
  });

  return NextResponse.json(user);
}
