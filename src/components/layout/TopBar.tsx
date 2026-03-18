"use client";

import Link from "next/link";
import { useAuth } from "@/lib/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Bell, LogOut } from "lucide-react";
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
    refresh(user.id);
  }, [user.id, refresh]);

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <header className="h-14 border-b border-zinc-200 bg-white flex items-center justify-between px-6 shrink-0">
      <div />
      <div className="flex items-center gap-1">
        <Link
          href="/notifications"
          className="relative p-2 rounded-lg hover:bg-zinc-100 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4 text-zinc-600" />
          {unread > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Link>
        <div className="flex items-center gap-2 px-2">
          <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-semibold">
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm text-zinc-700 font-medium hidden sm:block">
            {user.name}
          </span>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 transition-colors px-2 py-1.5 rounded-lg hover:bg-zinc-100"
          aria-label="Sign out"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:block">Sign out</span>
        </button>
      </div>
    </header>
  );
}
