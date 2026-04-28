import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

// PATCH /api/users/me/password — logged-in user changes their own password
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { currentPassword, newPassword } = await req.json();
  if (!currentPassword || !newPassword)
    return NextResponse.json(
      { error: "Both fields are required" },
      { status: 400 },
    );

  if (newPassword.length < 8)
    return NextResponse.json(
      { error: "Password must be at least 8 characters" },
      { status: 400 },
    );

  await connectDB();
  const userId = (session.user as any).id;
  const user = await User.findById(userId);
  if (!user)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid)
    return NextResponse.json(
      { error: "Current password is incorrect" },
      { status: 400 },
    );

  user.passwordHash = await bcrypt.hash(newPassword, 12);
  user.mustChangePassword = false;
  await user.save();

  return NextResponse.json({ success: true });
}
