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

  return (
    <header className="h-14 bg-white border-b border-zinc-100 flex items-center justify-between px-6 shrink-0 sticky top-0 z-30">
      <div />
      <div className="flex items-center gap-2">
        {/* Notification bell */}
        <Link
          href="/notifications"
          className="relative p-2 rounded-lg hover:bg-zinc-100 transition-colors"
          aria-label="Notifications"
        >
          <span className="material-symbols-outlined text-zinc-500 text-[22px]">
            notifications
          </span>
          {unread > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
          )}
        </Link>

        {/* Divider */}
        <div className="w-px h-5 bg-zinc-200 mx-1" />

        {/* User */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold shrink-0">
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm font-medium text-zinc-700 hidden sm:block">
            {user.name}
          </span>
        </div>

        {/* Sign out */}
        <button
          type="button"
          onClick={() => {
            logout();
            router.push("/login");
          }}
          className="p-2 rounded-lg hover:bg-zinc-100 transition-colors text-zinc-400 hover:text-zinc-700"
          aria-label="Sign out"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
        </button>
      </div>
    </header>
  );
}
