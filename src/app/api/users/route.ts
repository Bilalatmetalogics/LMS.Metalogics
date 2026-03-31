import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

// GET /api/users — admin only
export async function GET() {
  const session = await auth();
  if ((session?.user as any)?.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  await connectDB();
  const users = await User.find({}, "-passwordHash").lean();
  return NextResponse.json(users);
}

// POST /api/users — admin creates user
export async function POST(req: NextRequest) {
  const session = await auth();
  if ((session?.user as any)?.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { name, email, password, role } = await req.json();
  if (!name || !email || !password)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  await connectDB();
  const exists = await User.findOne({ email });
  if (exists)
    return NextResponse.json(
      { error: "Email already exists" },
      { status: 409 },
    );
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({
    name,
    email,
    passwordHash,
    role: role || "student",
  });
  return NextResponse.json(
    {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    },
    { status: 201 },
  );
}
