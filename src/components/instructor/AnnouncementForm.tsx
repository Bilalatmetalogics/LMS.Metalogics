"use client";

import { useState } from "react";);

  const [loading, setLoading] = useState(false);
  const [error, setError] = u"");

export default function AnnouncementForm({ courseId }: { courseId?: string }) {
  const [form, setForm] = useState({ title: "", body: "" });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, courseId }),
    });

    if (res.ok) {
      setForm({ title: "", body: "" });
      setSent(true);
      setTimeout(() => setSent(false), 3000);
    } else {
      setError("Failed to send announcement");
    }
    setLoading(false);
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
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
      <div className="space-y-1">
        <label htmlFor="ann-title" className="text-sm font-medium text-zinc-700">
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
          disabled={loading}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {loading ? "Sending..." : "Send announcement"}
        </button>
      </div>
    </form>
  );
}