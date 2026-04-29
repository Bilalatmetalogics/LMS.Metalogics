"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/useAuth";
import Link from "next/link";
import { BookOpen, ChevronRight } from "lucide-react";
import { TableRowSkeleton } from "@/components/ui/skeleton";

type Course = {
  _id: string;
  title: string;
  category: string;
  modules: any[];
  status: string;
  createdBy?: { name: string; email: string };
};

export default function InstructorCoursesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/courses")
      .then((r) => r.json())
      .then((data) => {
        setCourses(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (!user || !["admin", "instructor"].includes(user.role)) return null;

  const isAdmin = user.role === "admin";

  return (
    <div className="space-y-6 text-white">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {isAdmin ? "All Courses" : "My Courses"}
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {loading
              ? "Loading…"
              : `${courses.length} course${courses.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Link
          href="/instructor/courses/new"
          className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-500 to-blue-600 text-white text-sm font-semibold rounded-xl shadow-lg transition hover:opacity-90"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          New course
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
        {!loading && courses.length === 0 ? (
          <div className="py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 border border-white/10 mb-4">
              <BookOpen className="h-6 w-6 text-slate-500" />
            </div>
            <p className="text-sm font-medium text-white">No courses yet</p>
            <p className="text-xs text-slate-500 mt-1">
              Create your first course to get started
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02]">
                <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Title
                </th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Category
                </th>
                {isAdmin && (
                  <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Instructor
                  </th>
                )}
                <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Modules
                </th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Status
                </th>
                <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <TableRowSkeleton key={i} cols={isAdmin ? 6 : 5} />
                  ))
                : courses.map((c) => (
                    <tr
                      key={c._id}
                      className="hover:bg-white/[0.03] transition-colors"
                    >
                      <td className="px-5 py-3.5 font-medium text-white">
                        {c.title}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs text-slate-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                          {c.category}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="px-5 py-3.5 text-xs text-slate-400">
                          {c.createdBy?.name || "—"}
                        </td>
                      )}
                      <td className="px-5 py-3.5 text-slate-300">
                        {c.modules?.length || 0}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${
                            c.status === "published"
                              ? "bg-emerald-500/15 text-emerald-300 border-emerald-400/30"
                              : "bg-amber-500/15 text-amber-300 border-amber-400/30"
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-3">
                          <Link
                            href={`/courses/${c._id}`}
                            className="text-xs text-slate-400 hover:text-white transition-colors"
                          >
                            View
                          </Link>
                          <Link
                            href={`/instructor/courses/${c._id}`}
                            className="flex items-center gap-0.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                          >
                            Edit <ChevronRight className="h-3 w-3" />
                          </Link>
                          <Link
                            href={`/instructor/grades?courseId=${c._id}`}
                            className="text-xs text-slate-400 hover:text-white transition-colors"
                          >
                            Grades
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
