import type { NextAuthConfig } from "next-auth";

// Edge-safe config — no Node.js modules (no mongoose, no bcrypt)
export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;
      const isPublic =
        pathname === "/" ||
        pathname.startsWith("/login") ||
        pathname.startsWith("/api/auth") ||
        pathname.startsWith("/api/debug");

      // Authenticated user hitting the root → send to dashboard
      if (isLoggedIn && pathname === "/") {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }

      if (isPublic) return true;
      return isLoggedIn;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.mustChangePassword = (user as any).mustChangePassword ?? false;
        token.avatarUrl = (user as any).avatarUrl ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub;
        (session.user as any).role = token.role;
        (session.user as any).mustChangePassword = token.mustChangePassword;
        (session.user as any).avatarUrl = token.avatarUrl ?? null;
      }
      return session;
    },
  },
};
