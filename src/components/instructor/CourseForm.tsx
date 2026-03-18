"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { db, MockCourse } from "@/lib/mockStore";
import { useAuth } from "@/lib/useAuth";

export default function CourseForm({ course }: { course?: MockCourse }) {
  const { user } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    title: course?.title || "",
    description: course?.description || "",
    category: course?.category || "",
    status: course?.status || "draft",
  });
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    if (course) {
      db.courses.upsert({
        ...course,
        ...form,
        status: form.status as "draft" | "published",
      });
      router.push(`/instructor/courses/${course.id}`);
    } else {
      const newCourse: MockCourse = {
        id: crypto.randomUUID(),
        ...form,
        status: form.status as "draft" | "published",
        createdBy: user!.id,
        modules: [],
      };
      db.courses.upsert(newCourse);
      router.push(`/instructor/courses/${newCourse.id}`);
    }
    setLoading(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-zinc-200 rounded-xl p-6 space-y-4"
    >
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
            onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
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
