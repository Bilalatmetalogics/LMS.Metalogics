"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";

type Course = {
  _id: string;
  title: string;
  description: string;
  category: string;
  level?: "beginner" | "intermediate" | "advanced";
  status: "draft" | "published";
};

export default function CourseForm({ course }: { course?: Course }) {
  const router = useRouter();
  const [form, setForm] = useState({
    title: course?.title || "",
    description: course?.description || "",
    category: course?.category || "",
    level: (course?.level || "beginner") as
      | "beginner"
      | "intermediate"
      | "advanced",
    status: (course?.status || "draft") as "draft" | "published",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSaved(false);

    const res = course
      ? await fetch(`/api/courses/${course._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        })
      : await fetch("/api/courses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });

    if (res.ok) {
      const data = await res.json();
      if (!course) {
        router.push(`/instructor/courses/${data._id || data.id}`);
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        router.refresh();
      }
    } else {
      const body = await res.json().catch(() => ({}));
      setError(body.error || "Failed to save course");
    }
    setLoading(false);
  }

  const inputCls =
    "w-full px-3 py-2.5 text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 outline-none focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-500/20 transition-all";
  const labelCls = "text-xs font-medium text-slate-300";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {saved && (
        <div className="flex items-center gap-2 text-sm text-emerald-300 bg-emerald-500/10 border border-emerald-400/30 rounded-xl px-3 py-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          Course saved.
        </div>
      )}
      {error && (
        <p className="text-sm text-red-300 bg-red-500/10 border border-red-400/30 rounded-xl px-3 py-2">
          {error}
        </p>
      )}

      <div className="space-y-1.5">
        <label htmlFor="course-title" className={labelCls}>
          Title
        </label>
        <input
          id="course-title"
          type="text"
          value={form.title}
          onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
          required
          placeholder="e.g. Onboarding Fundamentals"
          className={inputCls}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="course-desc" className={labelCls}>
          Description
        </label>
        <textarea
          id="course-desc"
          value={form.description}
          onChange={(e) =>
            setForm((p) => ({ ...p, description: e.target.value }))
          }
          required
          rows={3}
          placeholder="What will staff learn in this course?"
          className={`${inputCls} resize-none`}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="course-category" className={labelCls}>
            Category
          </label>
          <input
            id="course-category"
            type="text"
            value={form.category}
            onChange={(e) =>
              setForm((p) => ({ ...p, category: e.target.value }))
            }
            required
            placeholder="e.g. Safety, HR, Technical"
            className={inputCls}
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="course-level" className={labelCls}>
            Level
          </label>
          <select
            id="course-level"
            value={form.level}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                level: e.target.value as
                  | "beginner"
                  | "intermediate"
                  | "advanced",
              }))
            }
            className={inputCls}
          >
            <option value="beginner" className="bg-slate-900">
              Beginner
            </option>
            <option value="intermediate" className="bg-slate-900">
              Intermediate
            </option>
            <option value="advanced" className="bg-slate-900">
              Advanced
            </option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="course-status" className={labelCls}>
            Status
          </label>
          <select
            id="course-status"
            value={form.status}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                status: e.target.value as "draft" | "published",
              }))
            }
            className={inputCls}
          >
            <option value="draft" className="bg-slate-900">
              Draft
            </option>
            <option value="published" className="bg-slate-900">
              Published
            </option>
          </select>
        </div>
      </div>

      <div className="flex justify-end pt-1">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-blue-600 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-all hover:opacity-90"
        >
          {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          {loading ? "Saving…" : course ? "Save changes" : "Create course"}
        </button>
      </div>
    </form>
  );
}
