import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { authConfig } from "./auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          await connectDB();
        } catch (err) {
          console.error("[auth] DB connection failed:", err);
          return null;
        }

        const user = await User.findOne({
          email: credentials.email,
          isActive: true,
        }).lean();

        if (!user) {
          console.error("[auth] No user found for:", credentials.email);
          return null;
        }

        const valid = await bcrypt.compare(
          credentials.password as string,
          (user as any).passwordHash,
        );

        if (!valid) {
          console.error("[auth] Wrong password for:", credentials.email);
          return null;
        }

        return {
          id: (user as any)._id.toString(),
          name: (user as any).name,
          email: (user as any).email,
          role: (user as any).role,
          mustChangePassword: (user as any).mustChangePassword ?? false,
        };
      },
    }),
  ],
});
