"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

type Course = {
  _id: string;
  title: string;
  description: string;
  category: string;
  status: "draft" | "published";
};

export default function CourseForm({ course }: { course?: Course }) {
  const router = useRouter();
  const [form, setForm] = useState({
    title: course?.title || "",
    description: course?.description || "",
    category: course?.category || "",
    status: (course?.status || "draft") as "draft" | "published",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
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
        // New course — navigate to editor
        const id = data._id || data.id;
        router.push(`/instructor/courses/${id}`);
      } else {
        // Existing course — stay on page, show confirmation
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

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-zinc-200 rounded-xl p-6 space-y-4"
    >
      {saved && (
        <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          Course saved.
        </div>
      )}
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
      <div className="space-y-1">
        <label
          htmlFor="course-title"
          className="text-sm font-medium text-zinc-700"
        >
          Title
        </label>
        <input
          id="course-title"
          type="text"
          value={form.title}
          onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
          required
          placeholder="e.g. Onboarding Fundamentals"
          className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      <div className="space-y-1">
        <label
          htmlFor="course-desc"
          className="text-sm font-medium text-zinc-700"
        >
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
          className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label
            htmlFor="course-category"
            className="text-sm font-medium text-zinc-700"
          >
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
            className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="space-y-1">
          <label
            htmlFor="course-status"
            className="text-sm font-medium text-zinc-700"
          >
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
            className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
      </div>
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {loading ? "Saving..." : course ? "Save changes" : "Create course"}
        </button>
      </div>
    </form>
  );
}
