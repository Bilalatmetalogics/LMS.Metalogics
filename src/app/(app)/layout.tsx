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
    <div className="flex h-screen overflow-hidden bg-zinc-50">
      <Sidebar role={user.role} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar user={user} />
        <main className="flex-1 overflow-y-auto p-6 md:pl-6 pl-14">
          {children}
        </main>
      </div>
    </div>
  );
}
