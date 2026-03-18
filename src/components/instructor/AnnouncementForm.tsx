"use client";

import { useState } from "react";
import { db } from "@/lib/mockStore";
import { useAuth } from "@/lib/useAuth";
import { useNotifications } from "@/lib/useNotifications";

export default function AnnouncementForm({ courseId }: { courseId?: string }) {
  const { user } = useAuth();
  const { refresh } = useNotifications();
  const [form, setForm] = useState({ title: "", body: "" });
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    // Notify all relevant users
    const allUsers = db.users.getAll().filter((u) => u.isActive);
    const targets = courseId
      ? allUsers.filter((u) => u.assignedCourses.includes(courseId))
      : allUsers;

    targets.forEach((u) => {
      db.notifications.add({
        id: crypto.randomUUID(),
        userId: u.id,
        type: "announcement",
        message: `📢 ${form.title}: ${form.body}`,
        link: courseId ? `/courses/${courseId}` : "/dashboard",
        read: false,
        createdAt: new Date().toISOString(),
      });
    });

    setForm({ title: "", body: "" });
    setSent(true);
    if (user) refresh(user.id);
    setTimeout(() => setSent(false), 3000);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-zinc-200 rounded-xl p-4 space-y-3"
    >
      {sent && (
        <p className="text-sm text-green-600 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
          Announcement sent.
        </p>
      )}
      <div className="space-y-1">
        <label
          htmlFor="ann-title"
          className="text-sm font-medium text-zinc-700"
        >
          Title
        </label>
        <input
          id="ann-title"
          type="text"
          value={form.title}
          onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
          required
          placeholder="Announcement title"
          className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="ann-body" className="text-sm font-medium text-zinc-700">
          Message
        </label>
        <textarea
          id="ann-body"
          value={form.body}
          onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))}
          required
          rows={3}
          placeholder="Write your announcement..."
          className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        />
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Send announcement
        </button>
      </div>
    </form>
  );
}
