"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/lib/useAuth";
import { useRouter, useSearchParams } from "next/navigation";
import { ClipboardList, Search, X } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
import { TableRowSkeleton } from "@/components/ui/skeleton";

type Course = { _id: string; title: string };
type Result = {
  _id: string;
  userId: { name: string; email: string };
  assessmentId: { title: string; passingScore: number };
  score: number;
  passed: boolean;
  gradedAt?: string;
  createdAt: string;
};

const PAGE_SIZE = 10;

function StatusBadge({
  passed,
  gradedAt,
}: {
  passed: boolean;
  gradedAt?: string;
}) {
  if (!gradedAt) {
    return (
      <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full border bg-amber-500/15 text-amber-300 border-amber-400/30">
        Pending review
      </span>
    );
  }
  return (
    <span
      className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${
        passed
          ? "bg-emerald-500/15 text-emerald-300 border-emerald-400/30"
          : "bg-red-500/15 text-red-300 border-red-400/30"
      }`}
    >
      {passed ? "Passed" : "Failed"}
    </span>
  );
}

export default function GradesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId") || "";

  const [courses, setCourses] = useState<Course[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingResults, setLoadingResults] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetch("/api/courses")
      .then((r) => r.json())
      .then((data) => {
        setCourses(data);
        setLoadingCourses(false);
      })
      .catch(() => setLoadingCourses(false));
  }, []);

  useEffect(() => {
    if (!courseId) return;
    setLoadingResults(true);
    setPage(1);
    setSearch("");
    fetch(`/api/grades?courseId=${courseId}`)
      .then((r) => r.json())
      .then((data) => {
        setResults(data);
        setLoadingResults(false);
      })
      .catch(() => setLoadingResults(false));
  }, [courseId]);

  // Filter by search
  const filtered = useMemo(() => {
    if (!search.trim()) return results;
    const q = search.toLowerCase();
    return results.filter(
      (r) =>
        r.userId?.name?.toLowerCase().includes(q) ||
        r.userId?.email?.toLowerCase().includes(q) ||
        r.assessmentId?.title?.toLowerCase().includes(q),
    );
  }, [results, search]);

  // Paginate
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset page when search changes
  useEffect(() => {
    setPage(1);
  }, [search]);

  if (!user || !["admin", "instructor"].includes(user.role)) return null;

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Grade Book
        </h1>
        <p className="text-sm text-slate-400 mt-0.5">
          Review assessment submissions
        </p>
      </div>

      {/* Course selector + search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <select
          id="course-select"
          value={courseId}
          onChange={(e) =>
            router.push(`/instructor/grades?courseId=${e.target.value}`)
          }
          aria-label="Select course"
          className="px-3 py-2.5 text-sm bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
        >
          <option value="" className="bg-slate-900">
            Select a course…
          </option>
          {courses.map((c) => (
            <option key={c._id} value={c._id} className="bg-slate-900">
              {c.title}
            </option>
          ))}
        </select>

        {courseId && (
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email or assessment…"
              className="w-full pl-10 pr-10 py-2.5 text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 outline-none focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      {courseId && (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02]">
                <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Staff
                </th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Assessment
                </th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Score
                </th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Result
                </th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Submitted
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loadingResults ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRowSkeleton key={i} cols={5} />
                ))
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <ClipboardList className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">
                      {search
                        ? "No results match your search"
                        : "No submissions yet"}
                    </p>
                    {search && (
                      <button
                        type="button"
                        onClick={() => setSearch("")}
                        className="mt-2 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                      >
                        Clear search
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                paginated.map((r) => (
                  <tr
                    key={r._id}
                    className="hover:bg-white/[0.03] transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-white">{r.userId?.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {r.userId?.email}
                      </p>
                    </td>
                    <td className="px-5 py-3.5 text-slate-300">
                      {r.assessmentId?.title}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-semibold text-white">
                        {r.score}%
                      </span>
                      <span className="text-xs text-slate-500 ml-1">
                        / {r.assessmentId?.passingScore}% pass
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge passed={r.passed} gradedAt={r.gradedAt} />
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-400">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {!loadingResults && filtered.length > PAGE_SIZE && (
            <div className="border-t border-white/5 px-5">
              <Pagination
                page={page}
                totalPages={totalPages}
                onPage={setPage}
                totalItems={filtered.length}
                pageSize={PAGE_SIZE}
              />
            </div>
          )}
        </div>
      )}

      {!courseId && !loadingCourses && (
        <div className="py-24 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 border border-white/10 mb-4">
            <ClipboardList className="h-7 w-7 text-slate-500" />
          </div>
          <p className="text-sm font-medium text-white">
            Select a course to view grades
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Choose a course from the dropdown above
          </p>
        </div>
      )}
    </div>
  );
}
