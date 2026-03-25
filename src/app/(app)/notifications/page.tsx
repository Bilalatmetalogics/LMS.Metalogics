"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useNotifications } from "@/lib/useNotifications";
import { Bell } from "lucide-react";

type Notif = {
  _id: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
};

export default function NotificationsPage() {
  const { refresh, markRead } = useNotifications();
  const [notifications, setNotifications] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch("/api/notifications");
    if (res.ok) setNotifications(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function markAllRead() {
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n._id);
    if (!unreadIds.length) return;
    await markRead(unreadIds);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    refresh();
  }

  if (loading) return null;

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
                key={n._id}
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
