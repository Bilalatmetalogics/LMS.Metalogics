import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { sendPasswordResetEmail } from "@/lib/email";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await auth();
  if ((session?.user as any)?.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await connectDB();
  const body = await req.json();

  // Admin-triggered password reset — generates new temp password and emails user
  if (body.resetPassword) {
    const user = await User.findById(id);
    if (!user)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    const tempPassword = generateTempPassword();
    user.passwordHash = await bcrypt.hash(tempPassword, 12);
    user.mustChangePassword = true;
    await user.save();

    let emailSent = false;
    try {
      await sendPasswordResetEmail({
        name: user.name,
        email: user.email,
        tempPassword,
      });
      emailSent = true;
    } catch (err) {
      console.error("[email] Failed to send reset email:", err);
    }

    return NextResponse.json({ success: true, emailSent });
  }

  // Regular field update (name, role, isActive, etc.)
  if (body.password) {
    body.passwordHash = await bcrypt.hash(body.password, 12);
    delete body.password;
  }

  const user = await User.findByIdAndUpdate(id, body, {
    new: true,
    select: "-passwordHash",
  });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(user);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await auth();
  if ((session?.user as any)?.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Prevent admin from deleting themselves
  if ((session?.user as any)?.id === id)
    return NextResponse.json(
      { error: "You cannot delete your own account" },
      { status: 400 },
    );

  await connectDB();

  const { searchParams } = new URL(req.url);
  const hard = searchParams.get("hard") === "true";

  if (hard) {
    // Hard delete — permanently removes the user document
    await User.findByIdAndDelete(id);
  } else {
    // Soft delete — deactivate only
    await User.findByIdAndUpdate(id, { isActive: false });
  }

  return NextResponse.json({ success: true });
}

function generateTempPassword(): string {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghjkmnpqrstuvwxyz";
  const digits = "23456789";
  const special = "@#$!";
  const rand = (str: string) => str[Math.floor(Math.random() * str.length)];
  const required = [rand(upper), rand(lower), rand(digits), rand(special)];
  const all = upper + lower + digits + special;
  const rest = Array.from({ length: 6 }, () => rand(all));
  return [...required, ...rest].sort(() => Math.random() - 0.5).join("");
}
