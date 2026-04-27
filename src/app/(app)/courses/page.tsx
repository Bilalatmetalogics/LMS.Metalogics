"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/lib/useAuth";
import { useNotifications } from "@/lib/useNotifications";
import Link from "next/link";
import CourseCard from "@/components/ui/CourseCard";

type Course = {
  _id: string;
  title: string;
  description: string;
  category: string;
  status: "draft" | "published";
  createdBy?: { name: string };
  modules?: any[];
};

export default function CoursesPage() {
  const { user } = useAuth();
  const { subscribe } = useNotifications();
  const [courses, setCourses] = useState<Course[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const fetchCourses = useCallback(async () => {
    const res = await fetch("/api/courses");
    if (!res.ok) {
      setLoading(false);
      return;
    }
    const data: Course[] = await res.json();
    setCourses(data);

    // For students, also fetch progress
    if (user?.role === "student") {
      const progressResults = await Promise.all(
        data.map((c) =>
          fetch(`/api/progress?courseId=${c._id}`).then((r) =>
            r.ok ? r.json() : [],
          ),
        ),
      );
      const map: Record<string, number> = {};
      data.forEach((c, i) => {
        const allVideos = c.modules?.flatMap((m: any) => m.videos) || [];
        const completed = progressResults[i].filter(
          (p: any) => p.completed,
        ).length;
        map[c._id] = allVideos.length
          ? Math.round((completed / allVideos.length) * 100)
          : 0;
      });
      setProgressMap(map);
    }
    setLoading(false);
  }, [user?.role]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  useEffect(() => {
    if (user?.role !== "student") return;
    const unsub = subscribe((payload) => {
      if (payload.type === "assignment") fetchCourses();
    });
    return unsub;
  }, [user?.role, subscribe, fetchCourses]);

  if (!user || loading) return null;

  const isStaff = ["admin", "instructor"].includes(user.role);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">
            {user.role === "student" ? "My Courses" : "Courses"}
          </h1>
          <p className="text-sm text-zinc-400 mt-0.5">
            {courses.length} course{courses.length !== 1 ? "s" : ""}
          </p>
        </div>
        {isStaff && (
          <Link
            href="/instructor/courses/new"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            New course
          </Link>
        )}
      </div>

      {courses.length === 0 ? (
        <div className="py-24 text-center">
          <span className="material-symbols-outlined text-zinc-200 text-[64px]">
            school
          </span>
          <p className="text-sm text-zinc-400 mt-3">
            {user.role === "student"
              ? "No courses assigned yet."
              : "No courses yet."}
          </p>
        </div>
      ) : isStaff ? (
        /* Staff: clean table */
        <div className="bg-white rounded-xl border border-zinc-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/80">
                <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-500">
                  Title
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-500">
                  Category
                </th>
                {user.role === "admin" && (
                  <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-500">
                    Created by
                  </th>
                )}
                <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-500">
                  Status
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {courses.map((c) => (
                <tr
                  key={c._id}
                  className="hover:bg-zinc-50/60 transition-colors"
                >
                  <td className="px-5 py-3.5 font-medium text-zinc-900">
                    {c.title}
                  </td>
                  <td className="px-5 py-3.5 text-zinc-500 text-xs">
                    {c.category}
                  </td>
                  {user.role === "admin" && (
                    <td className="px-5 py-3.5 text-zinc-400 text-xs">
                      {(c.createdBy as any)?.name || "—"}
                    </td>
                  )}
                  <td className="px-5 py-3.5">
                    <span
                      className={`px-2 py-0.5 text-[11px] font-semibold rounded-full ${c.status === "published" ? "bg-emerald-50 text-emerald-700" : "bg-zinc-100 text-zinc-500"}`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 flex items-center gap-3">
                    <Link
                      href={`/courses/${c._id}`}
                      className="text-xs text-zinc-400 hover:text-zinc-700 transition-colors"
                    >
                      View
                    </Link>
                    <Link
                      href={`/instructor/courses/${c._id}`}
                      className="text-xs text-indigo-600 hover:underline font-medium"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Student: Netflix-style card grid */
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {courses.map((c) => (
            <CourseCard
              key={c._id}
              id={c._id}
              title={c.title}
              description={c.description}
              category={c.category}
              pct={progressMap[c._id]}
              href={`/courses/${c._id}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
