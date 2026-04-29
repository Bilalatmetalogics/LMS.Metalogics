/**
 * One-time cleanup: removes the old demo seed accounts.
 * Run once: npm run cleanup-demo
 */
import mongoose from "mongoose";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

const MONGODB_URI = process.env.MONGODB_URI!;

async function cleanup() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  const result = await mongoose.connection.collection("users").deleteMany({
    email: {
      $in: [
        "admin@company.com",
        "instructor@company.com",
        "student@company.com",
      ],
    },
  });

  console.log(`✓ Deleted ${result.deletedCount} demo user(s)`);
  await mongoose.disconnect();
  console.log("Done.");
}

cleanup().catch(console.error);
