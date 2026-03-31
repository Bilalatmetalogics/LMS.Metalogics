"use client";

import { useAuth } from "@/lib/useAuth";
import { useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, status } = useAuth();

  useEffect(() => {
    if (status === "unauthenticated") {
      window.location.href = "/login";
    }
  }, [status]);

  // Show spinner while session is resolving
  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-50">
        <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Unauthenticated — useEffect will redirect, render nothing meanwhile
  if (status === "unauthenticated" || !user) return null;

  return (
    <div className="flex min-h-screen bg-[#fbf8ff]">
      <Sidebar role={user.role} />
      <div className="flex flex-col flex-1 min-w-0">
        <TopBar user={user} />
        <main className="flex-1 px-8 py-8 md:pl-8 pl-16">{children}</main>
      </div>
    </div>
  );
}
