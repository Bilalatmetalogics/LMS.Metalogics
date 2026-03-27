import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { v2 as cloudinary } from "cloudinary";

// REMOVE THIS FILE BEFORE GOING TO PRODUCTION
export async function GET() {
  // MongoDB check
  let dbStatus: Record<string, any> = { connected: false };
  try {
    await connectDB();
    const count = await User.countDocuments();
    const users = await User.find({}, "email role isActive").lean();
    dbStatus = { connected: true, userCount: count, users };
  } catch (err: any) {
    dbStatus = { connected: false, error: err.message };
  }

  // Cloudinary check
  let cloudinaryStatus: Record<string, any> = { configured: false };
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    const result = await cloudinary.api.ping();
    cloudinaryStatus = {
      configured: true,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      ping: result,
    };
  } catch (err: any) {
    cloudinaryStatus = {
      configured: false,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME || "NOT SET",
      error: err.message,
    };
  }

  return NextResponse.json({ db: dbStatus, cloudinary: cloudinaryStatus });
}
