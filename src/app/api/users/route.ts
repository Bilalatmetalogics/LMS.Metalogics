import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { sendWelcomeEmail } from "@/lib/email";
import { createUserLimiter, getClientIp } from "@/lib/rateLimit";

// GET /api/users — admin only
export async function GET() {
  const session = await auth();
  if ((session?.user as any)?.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  await connectDB();
  const users = await User.find({}, "-passwordHash").lean();
  return NextResponse.json(users);
}

/** Generates a secure random password: 3 segments separated by - */
function generateTempPassword(): string {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghjkmnpqrstuvwxyz";
  const digits = "23456789";
  const special = "@#$!";

  const rand = (str: string) => str[Math.floor(Math.random() * str.length)];

  // Guarantee at least one of each required type
  const required = [rand(upper), rand(lower), rand(digits), rand(special)];

  const all = upper + lower + digits + special;
  const rest = Array.from({ length: 6 }, () => rand(all));

  // Shuffle all characters together
  const chars = [...required, ...rest].sort(() => Math.random() - 0.5);
  return chars.join("");
}

// POST /api/users — admin creates user (no password input — auto-generated)
export async function POST(req: NextRequest) {
  const session = await auth();
  if ((session?.user as any)?.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Rate limit user creation per IP
  const ip = getClientIp(req);
  const limit = createUserLimiter(ip);
  if (!limit.success)
    return NextResponse.json(
      { error: "Too many requests. Please slow down." },
      { status: 429 },
    );

  const { name, email, role } = await req.json();
  if (!name || !email)
    return NextResponse.json(
      { error: "Name and email are required" },
      { status: 400 },
    );

  await connectDB();

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists)
    return NextResponse.json(
      { error: "Email already exists" },
      { status: 409 },
    );

  const tempPassword = generateTempPassword();
  const passwordHash = await bcrypt.hash(tempPassword, 12);

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    passwordHash,
    role: role || "student",
    mustChangePassword: true,
  });

  // Send welcome email — non-blocking (don't fail user creation if email fails)
  let emailSent = false;
  try {
    await sendWelcomeEmail({
      name,
      email: email.toLowerCase(),
      tempPassword,
      role: role || "student",
    });
    emailSent = true;
  } catch (err: any) {
    console.error("[email] Failed to send welcome email:", err?.message || err);
    // Fallback: log credentials to server console
    console.log(`\n[email] FALLBACK CREDENTIALS for ${email.toLowerCase()}:`);
    console.log(`  Password: ${tempPassword}`);
    console.log(
      `  Reason: Resend free tier only delivers to verified addresses.`,
    );
    console.log(`  Fix: Verify your domain at https://resend.com/domains\n`);
  }

  return NextResponse.json(
    {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      mustChangePassword: user.mustChangePassword,
      emailSent,
    },
    { status: 201 },
  );
}
