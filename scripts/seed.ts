/**
 * Seed script — creates the initial admin account.
 *
 * Usage:
 *   npm run seed              — creates MBK admin only if it doesn't exist
 *   npm run seed -- --force   — overwrites existing MBK admin (resets password)
 *
 * This script is SAFE to run multiple times. It will NOT recreate deleted users.
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) throw new Error("MONGODB_URI is not defined in .env.local");

const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    passwordHash: String,
    role: String,
    assignedCourses: [mongoose.Schema.Types.ObjectId],
    isActive: { type: Boolean, default: true },
    mustChangePassword: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);

const ADMIN = {
  name: "MBK",
  email: "admin@metalogics.com",
  password: "Admin@MetaLogics2025",
  role: "admin",
};

async function seed() {
  const force = process.argv.includes("--force");

  await mongoose.connect(MONGODB_URI as string);
  console.log("Connected to MongoDB");

  const existing = await User.findOne({ email: ADMIN.email });

  if (existing && !force) {
    console.log(`\n✓ Admin account already exists: ${ADMIN.email}`);
    console.log("  Use --force to reset the password.");
    await mongoose.disconnect();
    return;
  }

  const passwordHash = await bcrypt.hash(ADMIN.password, 12);

  await User.findOneAndUpdate(
    { email: ADMIN.email },
    {
      name: ADMIN.name,
      email: ADMIN.email,
      passwordHash,
      role: ADMIN.role,
      isActive: true,
      mustChangePassword: false,
    },
    { upsert: true, new: true },
  );

  console.log(`\n✓ Admin account ${existing ? "reset" : "created"}:`);
  console.log(`  Email:    ${ADMIN.email}`);
  console.log(`  Password: ${ADMIN.password}`);
  console.log(`  Role:     admin`);
  console.log("\nSeed complete.");

  await mongoose.disconnect();
}

seed().catch(console.error);
