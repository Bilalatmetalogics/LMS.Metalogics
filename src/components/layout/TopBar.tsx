"use client";

import Link from "next/link";
import { useAuth } from "@/lib/useAuth";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useNotifications } from "@/lib/useNotifications";
import Image from "next/image";

// Derive a readable page title from the current path
function usePageTitle(): string {
  const pathname = usePathname();
  if (pathname === "/dashboard") return "Dashboard";
  if (pathname.startsWith("/admin/overview")) return "Overview";
  if (pathname.startsWith("/admin/users")) return "Users";
  if (pathname.startsWith("/admin/certificates")) return "Certificates";
  if (pathname.startsWith("/instructor/courses/new")) return "New Course";
  if (pathname.match(/\/instructor\/courses\/.+\/assessment/))
    return "Assessment Builder";
  if (pathname.match(/\/instructor\/courses\/.+/)) return "Edit Course";
  if (pathname.startsWith("/instructor/courses")) return "My Courses";
  if (pathname.startsWith("/instructor/grades")) return "Grade Book";
  if (pathname.match(/\/courses\/.+\/learn/)) return "Learning";
  if (pathname.match(/\/courses\/.+\/assessment/)) return "Assessment";
  if (pathname.match(/\/courses\/.+\/certificate/)) return "Certificate";
  if (pathname.match(/\/courses\/.+/)) return "Course";
  if (pathname.startsWith("/courses")) return "Courses";
  if (pathname.startsWith("/notifications")) return "Notifications";
  if (pathname.startsWith("/settings/profile")) return "Profile";
  if (pathname.startsWith("/settings/password")) return "Change Password";
  return "MetaLogics LMS";
}

export default function TopBar({
  user,
}: {
  user: { id: string; name: string };
}) {
  const { user: authUser, logout } = useAuth();
  const { unread, refresh } = useNotifications();
  const pageTitle = usePageTitle();

  useEffect(() => {
    refresh();
  }, [refresh]);

  const avatarUrl = authUser?.avatarUrl;
  const initials =
    user.name
      ?.split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() ?? "U";

  return (
    <header className="h-14 bg-[var(--sidebar)]/80 border-b border-[var(--sidebar-border)] backdrop-blur-xl flex items-center justify-between px-6 shrink-0 sticky top-0 z-30">
      {/* Page title */}
      <h2 className="text-sm font-semibold text-white/80 tracking-tight">
        {pageTitle}
      </h2>

      <div className="flex items-center gap-1.5">
        {/* Notification bell */}
        <Link
          href="/notifications"
          className="relative p-2 rounded-xl border border-transparent hover:border-white/10 hover:bg-white/5 transition-all"
          aria-label="Notifications"
        >
          <span className="material-symbols-outlined text-slate-400 hover:text-white text-[22px] transition-colors">
            notifications
          </span>
          {unread > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-rose-600 px-1 text-[9px] font-bold text-white shadow-lg">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Link>

        {/* Divider */}
        <div className="w-px h-5 bg-white/10 mx-1" />

        {/* User pill — links to profile */}
        <Link
          href="/settings/profile"
          className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 hover:bg-white/10 transition-all"
        >
          <div className="w-7 h-7 rounded-lg overflow-hidden bg-gradient-to-br from-indigo-400 to-blue-600 flex items-center justify-center text-[11px] font-bold text-white shrink-0">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={user.name}
                width={28}
                height={28}
                className="w-full h-full object-cover"
              />
            ) : (
              initials
            )}
          </div>
          <span className="text-sm font-medium text-white/80 hidden sm:block leading-none">
            {user.name}
          </span>
        </Link>

        {/* Sign out */}
        <button
          type="button"
          onClick={() => logout()}
          className="p-2 rounded-xl border border-transparent hover:border-white/10 hover:bg-rose-500/10 transition-all text-slate-500 hover:text-rose-400"
          aria-label="Sign out"
          title="Sign out"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
        </button>
      </div>
    </header>
  );
}
