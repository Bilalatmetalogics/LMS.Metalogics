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
  },
  { timestamps: true },
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);

async function seed() {
  await mongoose.connect(MONGODB_URI as string);
  console.log("Connected to MongoDB");

  const users = [
    {
      name: "Admin User",
      email: "admin@company.com",
      password: "Admin@123",
      role: "admin",
    },
    {
      name: "Jane Instructor",
      email: "instructor@company.com",
      password: "Instructor@123",
      role: "instructor",
    },
    {
      name: "John Student",
      email: "student@company.com",
      password: "Student@123",
      role: "student",
    },
  ];

  for (const u of users) {
    const passwordHash = await bcrypt.hash(u.password, 12);
    await User.findOneAndUpdate(
      { email: u.email },
      {
        name: u.name,
        email: u.email,
        passwordHash,
        role: u.role,
        isActive: true,
      },
      { upsert: true, new: true },
    );
    console.log(`✓ ${u.role}: ${u.email} / ${u.password}`);
  }

  await mongoose.disconnect();
  console.log("\nSeed complete.");
}

seed().catch(console.error);
