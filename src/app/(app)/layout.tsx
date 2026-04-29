"use client";

import { useAuth } from "@/lib/useAuth";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import Link from "next/link";
import { KeyRound } from "lucide-react";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, status } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      window.location.href = "/login";
    }
  }, [status]);

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-50">
        <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (status === "unauthenticated" || !user) return null;

  const mustChange = (user as any).mustChangePassword;
  const onPasswordPage = pathname === "/settings/password";

  return (
    <div className="dark flex min-h-screen bg-[var(--background)] relative">
      {/* ── Global animated background ── */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-mesh opacity-50" />
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="absolute -top-40 -left-40 h-[480px] w-[480px] rounded-full bg-indigo-500/10 blur-3xl animate-blob" />
        <div className="absolute top-1/3 -right-40 h-[520px] w-[520px] rounded-full bg-blue-500/10 blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-40 left-1/3 h-[480px] w-[480px] rounded-full bg-violet-500/10 blur-3xl animate-blob animation-delay-4000" />
      </div>

      <Sidebar role={user.role} />
      <div className="flex flex-col flex-1 min-w-0">
        <TopBar user={user} />

        {/* Must-change-password banner */}
        {mustChange && !onPasswordPage && (
          <div className="flex items-center justify-between gap-3 px-6 py-2.5 bg-amber-500/10 border-b border-amber-400/20 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-sm text-amber-300">
              <KeyRound className="w-4 h-4 shrink-0" />
              <span>
                You're using a temporary password. Please update it to secure
                your account.
              </span>
            </div>
            <Link
              href="/settings/password"
              className="shrink-0 text-xs font-semibold text-amber-300 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/30 px-3 py-1.5 rounded-lg transition-colors"
            >
              Change now →
            </Link>
          </div>
        )}

        <main className="flex-1 px-8 py-8 md:pl-8 pl-16 min-h-0">
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
