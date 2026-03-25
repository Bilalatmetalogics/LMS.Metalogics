import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

// REMOVE THIS FILE BEFORE GOING TO PRODUCTION
export async function GET() {
  try {
    await connectDB();
    const count = await User.countDocuments();
    const users = await User.find({}, "email role isActive").lean();
    return NextResponse.json({ connected: true, userCount: count, users });
  } catch (err: any) {
    return NextResponse.json(
      { connected: false, error: err.message },
      { status: 500 },
    );
  }
}
