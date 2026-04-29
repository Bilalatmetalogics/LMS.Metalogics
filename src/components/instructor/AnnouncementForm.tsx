"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Megaphone } from "lucide-react";

export default function AnnouncementForm({ courseId }: { courseId?: string }) {
  const [form, setForm] = useState({ title: "", body: "" });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
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

  const inputCls =
    "w-full px-3 py-2.5 text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 outline-none focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-500/20 transition-all";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {sent && (
        <div className="flex items-center gap-2 text-sm text-emerald-300 bg-emerald-500/10 border border-emerald-400/30 rounded-xl px-3 py-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          Announcement sent to all enrolled staff.
        </div>
      )}
      {error && (
        <p className="text-sm text-red-300 bg-red-500/10 border border-red-400/30 rounded-xl px-3 py-2">
          {error}
        </p>
      )}

      <div className="space-y-1.5">
        <label
          htmlFor="ann-title"
          className="text-xs font-medium text-slate-300"
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
          className={inputCls}
        />
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="ann-body"
          className="text-xs font-medium text-slate-300"
        >
          Message
        </label>
        <textarea
          id="ann-body"
          value={form.body}
          onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))}
          required
          rows={4}
          placeholder="Write your announcement…"
          className={`${inputCls} resize-none`}
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-blue-600 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-all hover:opacity-90"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Megaphone className="h-4 w-4" />
          )}
          {loading ? "Sending…" : "Send announcement"}
        </button>
      </div>
    </form>
  );
}
