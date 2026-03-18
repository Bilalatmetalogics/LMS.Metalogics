"use client";

import { useAuth } from "@/lib/useAuth";
import { db } from "@/lib/mockStore";
import { useMemo } from "react";
import Link from "next/link";

export default function CoursesPage() {
  const { user } = useAuth();
  if (!user) return null;

  const courses = useMemo(() => {
    const all = db.courses.getAll();
    if (user.role === "admin") return all;
    if (user.role === "instructor")
      return all.filter((c) => c.createdBy === user.id);
    return all.filter(
      (c) => user.assignedCourses.includes(c.id) && c.status === "published",
    );
  }, [user]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">Courses</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            {courses.length} course{courses.length !== 1 ? "s" : ""}
          </p>
        </div>
        {["admin", "instructor"].includes(user.role) && (
          <Link
            href="/instructor/courses/new"
            className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            New course
          </Link>
        )}
      </div>

      {courses.length === 0 ? (
        <div className="bg-white border border-zinc-200 rounded-xl py-16 text-center">
          <p className="text-sm text-zinc-400">No courses yet.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((c) => (
            <Link
              key={c.id}
              href={`/courses/${c.id}`}
              className="bg-white border border-zinc-200 rounded-xl p-4 hover:border-indigo-300 hover:shadow-sm transition group"
            >
              <div className="w-full h-32 bg-zinc-100 rounded-lg mb-3 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-zinc-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <p className="text-sm font-semibold text-zinc-900 group-hover:text-indigo-700 transition-colors">
                {c.title}
              </p>
              <p className="text-xs text-zinc-500 mt-1 line-clamp-2">
                {c.description}
              </p>
              <div className="flex items-center gap-2 mt-3">
                <span className="text-xs px-2 py-0.5 bg-zinc-100 text-zinc-600 rounded-full">
                  {c.category}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${c.status === "published" ? "bg-green-50 text-green-700" : "bg-zinc-100 text-zinc-500"}`}
                >
                  {c.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
