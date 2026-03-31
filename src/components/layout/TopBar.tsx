"use client";

import Link from "next/link";
import { useAuth } from "@/lib/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useNotifications } from "@/lib/useNotifications";

export default function TopBar({
  user,
}: {
  user: { id: string; name: string };
}) {
  const { logout } = useAuth();
  const router = useRouter();
  const { unread, refresh } = useNotifications();

  useEffect(() => {
    refresh();
  }, [refresh]);

  function handleLogout() {
    logout();
    router.push("/login");
  }

  const initials = user.name?.charAt(0).toUpperCase() ?? "?";

  return (
    <header className="h-16 sticky top-0 z-40 glass-panel border-b border-zinc-200/50 shadow-sm shadow-zinc-200/10 flex items-center justify-between px-8 shrink-0">
      {/* Left: search + nav tabs */}
      <div className="flex items-center gap-8">
        <div className="relative group hidden sm:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-[18px]">
            search
          </span>
          <input
            type="text"
            placeholder="Search knowledge base..."
            className="pl-10 pr-4 py-1.5 bg-zinc-100 border-none rounded-full text-xs w-56 focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/20 transition-all"
          />
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold">
          <Link
            href="/courses"
            className="text-[#3525cd] border-b-2 border-[#3525cd] pb-0.5 transition-all"
          >
            My Learning
          </Link>
          <span className="text-zinc-400 cursor-default">Resources</span>
        </nav>
      </div>

      {/* Right: bell + divider + user */}
      <div className="flex items-center gap-3">
        <Link
          href="/notifications"
          className="relative p-2 rounded-full hover:bg-zinc-100 transition-colors"
          aria-label="Notifications"
        >
          <span className="material-symbols-outlined text-zinc-600 text-[22px]">
            notifications
          </span>
          {unread > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-[#ba1a1a] rounded-full border-2 border-white" />
          )}
        </Link>

        <div className="h-8 w-px bg-zinc-200 mx-1" />

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-[#1a1b22] leading-none">
              {user.name}
            </p>
            <button
              type="button"
              onClick={handleLogout}
              className="text-[10px] text-zinc-500 hover:text-[#3525cd] transition-colors font-medium uppercase tracking-tight"
            >
              Sign Out
            </button>
          </div>
          <div className="w-9 h-9 rounded-full bg-[#e2dfff] flex items-center justify-center text-[#3525cd] text-sm font-black border-2 border-white shadow-sm shrink-0">
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
}
