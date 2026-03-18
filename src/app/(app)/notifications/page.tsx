"use client";

import { useAuth } from "@/lib/useAuth";
import { db } from "@/lib/mockStore";
import { useState, useMemo } from "react";
import Link from "next/link";
import { useNotifications } from "@/lib/useNotifications";
import { Bell } from "lucide-react";

export default function NotificationsPage() {
  const { user } = useAuth();
  const { refresh } = useNotifications();
  const [tick, setTick] = useState(0);
  if (!user) return null;

  // Refresh badge count when this page mounts
  useMemo(() => {
    if (user) refresh(user.id);
  }, [user?.id]); // eslint-disable-line

  const notifications = useMemo(
    () =>
      db.notifications
        .forUser(user.id)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [user.id, tick],
  );

  function markAllRead() {
    db.notifications.markRead(
      user!.id,
      notifications.map((n) => n.id),
    );
    refresh(user!.id);
    setTick((t) => t + 1);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-zinc-900">Notifications</h1>
        {notifications.some((n) => !n.read) && (
          <button
            type="button"
            onClick={markAllRead}
            className="text-xs text-indigo-600 hover:underline"
          >
            Mark all read
          </button>
        )}
      </div>
      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
        {notifications.length === 0 ? (
          <div className="py-16 text-center">
            <Bell className="w-8 h-8 text-zinc-200 mx-auto mb-3" />
            <p className="text-sm text-zinc-400">You&apos;re all caught up.</p>
          </div>
        ) : (
          <ul className="divide-y divide-zinc-100">
            {notifications.map((n) => (
              <li
                key={n.id}
                className={`px-4 py-3 flex items-start gap-3 ${!n.read ? "bg-indigo-50/40" : ""}`}
              >
                <div
                  className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!n.read ? "bg-indigo-500" : "bg-zinc-200"}`}
                />
                <div className="flex-1">
                  <p className="text-sm text-zinc-900">{n.message}</p>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
                {n.link && (
                  <Link
                    href={n.link}
                    className="text-xs text-indigo-600 hover:underline shrink-0"
                  >
                    View
                  </Link>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
