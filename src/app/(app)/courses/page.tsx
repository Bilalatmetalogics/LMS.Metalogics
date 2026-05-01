"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useAuth } from "@/lib/useAuth";
import { useNotifications } from "@/lib/useNotifications";
import Link from "next/link";
import { Search, X, BookOpen, Play, ChevronRight } from "lucide-react";
import { CourseTileSkeleton, TableRowSkeleton } from "@/components/ui/skeleton";

type Course = {
  _id: string;
  title: string;
  description: string;
  category: string;
  level?: "beginner" | "intermediate" | "advanced";
  status: "draft" | "published";
  createdBy?: { name: string };
  modules?: any[];
};

const LEVEL_COLORS = {
  beginner: "bg-emerald-500/20 text-emerald-300 border-emerald-400/30",
  intermediate: "bg-amber-500/20 text-amber-300 border-amber-400/30",
  advanced: "bg-red-500/20 text-red-300 border-red-400/30",
};

const LEVEL_GRADIENTS = {
  beginner: "from-emerald-900 via-teal-900 to-slate-900",
  intermediate: "from-amber-900 via-orange-900 to-slate-900",
  advanced: "from-red-900 via-rose-900 to-slate-900",
};

/* ── Course card (student grid) ─────────────────────────────── */
function CourseCard({
  course,
  progress,
}: {
  course: Course;
  progress?: number;
}) {
  const level = course.level || "beginner";
  const gradient = LEVEL_GRADIENTS[level];
  const levelColor = LEVEL_COLORS[level];

  return (
    <Link
      href={`/courses/${course._id}`}
      className="group relative flex-shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl transition-all hover:border-indigo-400/40 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/20"
    >
      {/* Thumbnail */}
      <div
        className={`relative aspect-video overflow-hidden bg-gradient-to-br ${gradient}`}
      >
        <div className="flex h-full w-full items-center justify-center">
          <BookOpen className="h-10 w-10 text-white/20" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 backdrop-blur">
            <Play className="h-5 w-5 fill-slate-900 text-slate-900 ml-0.5" />
          </div>
        </div>
        {/* Category + Level badges */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          {course.category && (
            <span className="rounded-full bg-slate-950/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-indigo-300 backdrop-blur">
              {course.category}
            </span>
          )}
          <span
            className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize backdrop-blur ${levelColor}`}
          >
            {level}
          </span>
        </div>
      </div>
      {/* Body */}
      <div className="p-4">
        <h3 className="line-clamp-1 font-semibold text-white group-hover:text-indigo-300 transition text-sm">
          {course.title}
        </h3>
        {course.description && (
          <p className="mt-1 text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {course.description}
          </p>
        )}
        {typeof progress === "number" && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-[10px] font-medium text-slate-400 mb-1.5">
              <span>Progress</span>
              <span className="text-indigo-300">{progress}%</span>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}

/* ── Main page ──────────────────────────────────────────────── */
export default function CoursesPage() {
  const { user } = useAuth();
  const { subscribe } = useNotifications();
  const [courses, setCourses] = useState<Course[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const fetchCourses = useCallback(async () => {
    const res = await fetch("/api/courses");
    if (!res.ok) {
      setLoading(false);
      return;
    }
    const data: Course[] = await res.json();
    setCourses(data);

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

  // Unique categories from courses
  const categories = useMemo(() => {
    const cats = Array.from(
      new Set(courses.map((c) => c.category).filter(Boolean)),
    );
    return cats.sort();
  }, [courses]);

  // Filtered courses
  const filtered = useMemo(() => {
    let result = courses;
    if (activeCategory !== "all") {
      result = result.filter((c) => c.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q) ||
          c.category?.toLowerCase().includes(q),
      );
    }
    return result;
  }, [courses, search, activeCategory]);

  if (!user) return null;

  const isStaff = ["admin", "instructor"].includes(user.role);

  return (
    <div className="space-y-6 text-white">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {user.role === "student" ? "My Courses" : "Courses"}
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {loading
              ? "Loading…"
              : `${filtered.length} of ${courses.length} course${courses.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        {isStaff && (
          <Link
            href="/instructor/courses/new"
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-500 to-blue-600 text-white text-sm font-semibold rounded-xl shadow-lg transition hover:opacity-90 hover:-translate-y-0.5"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            New course
          </Link>
        )}
      </div>

      {/* ── Search + filter bar ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses…"
            className="w-full pl-10 pr-10 py-2.5 text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 outline-none focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
              aria-label="Clear search"
              title="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Category pills */}
        {categories.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setActiveCategory("all")}
              className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-all ${
                activeCategory === "all"
                  ? "bg-indigo-500/20 border-indigo-400/40 text-indigo-300"
                  : "bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-white/20"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() =>
                  setActiveCategory(cat === activeCategory ? "all" : cat)
                }
                className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-all ${
                  activeCategory === cat
                    ? "bg-indigo-500/20 border-indigo-400/40 text-indigo-300"
                    : "bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-white/20"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Content ── */}
      {loading ? (
        isStaff ? (
          /* Staff skeleton — table rows */
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  {["Title", "Category", "Status", "Actions"].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-slate-500 font-semibold"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableRowSkeleton key={i} cols={4} />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Student skeleton — card grid */
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <CourseTileSkeleton key={i} />
            ))}
          </div>
        )
      ) : filtered.length === 0 ? (
        /* Empty state */
        <div className="py-24 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 border border-white/10 mb-4">
            <BookOpen className="h-7 w-7 text-slate-500" />
          </div>
          <p className="text-sm font-medium text-white">
            {search || activeCategory !== "all"
              ? "No courses match your search"
              : user.role === "student"
                ? "No courses assigned yet"
                : "No courses yet"}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {search || activeCategory !== "all"
              ? "Try a different search term or category"
              : user.role === "student"
                ? "Your instructor will assign courses to you"
                : "Create your first course to get started"}
          </p>
          {(search || activeCategory !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setActiveCategory("all");
              }}
              className="mt-4 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : isStaff ? (
        /* Staff: table */
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02]">
                <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Title
                </th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Category
                </th>
                {user.role === "admin" && (
                  <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Created by
                  </th>
                )}
                <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Level
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
              {filtered.map((c) => (
                <tr
                  key={c._id}
                  className="hover:bg-white/[0.03] transition-colors"
                >
                  <td className="px-5 py-3.5 font-medium text-white">
                    {c.title}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs text-slate-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                      {c.category || "—"}
                    </span>
                  </td>
                  {user.role === "admin" && (
                    <td className="px-5 py-3.5 text-slate-400 text-xs">
                      {(c.createdBy as any)?.name || "—"}
                    </td>
                  )}
                  <td className="px-5 py-3.5">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border capitalize ${
                        LEVEL_COLORS[c.level || "beginner"]
                      }`}
                    >
                      {c.level || "beginner"}
                    </span>
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
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Student: card grid */
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((c) => (
            <CourseCard key={c._id} course={c} progress={progressMap[c._id]} />
          ))}
        </div>
      )}
    </div>
  );
}
