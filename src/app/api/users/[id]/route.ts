import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

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
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await auth();
  if ((session?.user as any)?.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  await connectDB();
  await User.findByIdAndUpdate(id, { isActive: false });
  return NextResponse.json({ success: true });
}
