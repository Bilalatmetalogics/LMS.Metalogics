"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useNotifications } from "@/lib/useNotifications";
import {
  Bell,
  CheckCheck,
  Award,
  Unlock,
  ClipboardCheck,
  Megaphone,
} from "lucide-react";

type Notif = {
  _id: string;
  message: string;
  type?: string;
  link?: string;
  read: boolean;
  createdAt: string;
};

function NotifIcon({ type }: { type?: string }) {
  const cls = "h-4 w-4 shrink-0";
  switch (type) {
    case "unlock":
      return <Unlock className={`${cls} text-indigo-400`} />;
    case "grade":
      return <ClipboardCheck className={`${cls} text-emerald-400`} />;
    case "certificate":
      return <Award className={`${cls} text-amber-400`} />;
    case "announcement":
      return <Megaphone className={`${cls} text-blue-400`} />;
    default:
      return <Bell className={`${cls} text-slate-400`} />;
  }
}

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

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="max-w-2xl mx-auto space-y-6 text-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Notifications
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {loading
              ? "Loading…"
              : `${notifications.length} total · ${unreadCount} unread`}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllRead}
            className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Mark all read
          </button>
        )}
      </div>

      {/* List */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
        {loading ? (
          <div className="py-16 text-center">
            <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 border border-white/10 mb-4">
              <Bell className="h-6 w-6 text-slate-500" />
            </div>
            <p className="text-sm font-medium text-white">
              You're all caught up
            </p>
            <p className="text-xs text-slate-500 mt-1">No notifications yet</p>
          </div>
        ) : (
          <ul className="divide-y divide-white/5">
            {notifications.map((n) => (
              <li
                key={n._id}
                className={`flex items-start gap-3 px-5 py-4 transition-colors hover:bg-white/[0.03] ${
                  !n.read ? "bg-indigo-500/5" : ""
                }`}
              >
                {/* Unread dot */}
                <div className="mt-1 shrink-0">
                  {!n.read ? (
                    <div className="w-2 h-2 rounded-full bg-indigo-400" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-white/10" />
                  )}
                </div>

                {/* Icon */}
                <div className="mt-0.5 shrink-0">
                  <NotifIcon type={n.type} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm leading-snug ${!n.read ? "text-white font-medium" : "text-slate-300"}`}
                  >
                    {n.message}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>

                {/* Link */}
                {n.link && (
                  <Link
                    href={n.link}
                    className="shrink-0 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    View →
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
