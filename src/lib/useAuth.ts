"use client";

import { useSession, signOut } from "next-auth/react";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "instructor" | "student";
}

export function useAuth(): {
  user: AuthUser | null;
  status: "loading" | "authenticated" | "unauthenticated";
  logout: () => void;
} {
  const { data: session, status } = useSession();

  const user: AuthUser | null =
    status === "authenticated" && session?.user
      ? {
          id: (session.user as any).id,
          name: session.user.name ?? "",
          email: session.user.email ?? "",
          role: (session.user as any).role,
        }
      : null;

  function logout() {
    signOut({ callbackUrl: "/login" });
  }

  return { user, status, logout };
}
