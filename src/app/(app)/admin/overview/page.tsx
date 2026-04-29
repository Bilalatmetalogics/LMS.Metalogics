"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/lib/useAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  Users,
  ClipboardList,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Award,
  ChevronRight,
} from "lucide-react";
import { StatCardSkeleton, TableRowSkeleton } from "@/components/ui/skeleton";

type Course = {
  _id: string;
  title: string;
  category: string;
  status: string;
  createdBy?: { name: string };
  modules: { videos: any[] }[];
};
type GradeResult = {
  _id: string;
  userId: { name: string; email: string };
  assessmentId: { title: string };
  score: number;
  passed: boolean;
  createdAt: string;
};

/* ── Pure-CSS bar chart ─────────────────────────────────────── */
function BarChart({
  data,
  maxValue,
  color = "from-indigo-500 to-blue-600",
}: {
  data: { label: string; value: number }[];
  maxValue: number;
  color?: string;
}) {
  if (data.length === 0)
    return (
      <p className="text-xs text-slate-500 py-4 text-center">No data yet</p>
    );
  return (
    <div className="space-y-3">
      {data.map((item) => {
        const pct =
          maxValue > 0 ? Math.round((item.value / maxValue) * 100) : 0;
        return (
          <div key={item.label}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-300 truncate max-w-[60%]">
                {item.label}
              </span>
              <span className="text-xs font-semibold text-white">
                {item.value}
              </span>
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-700`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Donut chart (pure CSS) ─────────────────────────────────── */
function DonutChart({
  passed,
  failed,
  pending,
}: {
  passed: number;
  failed: number;
  pending: number;
}) {
  const total = passed + failed + pending;
  if (total === 0)
    return (
      <p className="text-xs text-slate-500 py-4 text-center">
        No submissions yet
      </p>
    );

  const passedPct = Math.round((passed / total) * 100);
  const failedPct = Math.round((failed / total) * 100);
  const pendingPct = 100 - passedPct - failedPct;

  // SVG donut
  const r = 40;
  const circ = 2 * Math.PI * r;
  const passedDash = (passedPct / 100) * circ;
  const failedDash = (failedPct / 100) * circ;
  const pendingDash = (pendingPct / 100) * circ;

  return (
    <div className="flex items-center gap-6">
      <svg width="100" height="100" viewBox="0 0 100 100" className="shrink-0">
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="12"
        />
        {/* Passed */}
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="#34d399"
          strokeWidth="12"
          strokeDasharray={`${passedDash} ${circ - passedDash}`}
          strokeDashoffset={circ / 4}
          strokeLinecap="round"
        />
        {/* Failed */}
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="#f87171"
          strokeWidth="12"
          strokeDasharray={`${failedDash} ${circ - failedDash}`}
          strokeDashoffset={circ / 4 - passedDash}
          strokeLinecap="round"
        />
        <text
          x="50"
          y="54"
          textAnchor="middle"
          fill="white"
          fontSize="14"
          fontWeight="700"
        >
          {passedPct}%
        </text>
      </svg>
      <div className="space-y-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
          <span className="text-slate-300">Passed</span>
          <span className="ml-auto font-semibold text-white">{passed}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400 shrink-0" />
          <span className="text-slate-300">Failed</span>
          <span className="ml-auto font-semibold text-white">{failed}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
          <span className="text-slate-300">Pending</span>
          <span className="ml-auto font-semibold text-white">{pending}</span>
        </div>
      </div>
    </div>
  );
}

/* ── Main page ──────────────────────────────────────────────── */
export default function AdminOverviewPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Record<string, number>>({});
  const [recentGrades, setRecentGrades] = useState<GradeResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.role !== "admin") router.replace("/dashboard");
  }, [user, router]);

  useEffect(() => {
    if (!user || user.role !== "admin") return;
    (async () => {
      const [coursesRes, gradesRes] = await Promise.all([
        fetch("/api/courses").then((r) => (r.ok ? r.json() : [])),
        fetch("/api/grades").then((r) => (r.ok ? r.json() : [])),
      ]);
      const allCourses: Course[] = coursesRes;
      setCourses(allCourses);
      setRecentGrades(gradesRes.slice(0, 10));

      const enrollData = await Promise.all(
        allCourses.map(async (c) => {
          try {
            const r = await fetch(`/api/courses/${c._id}/assign`);
            const d = r.ok ? await r.json() : { assigned: [] };
            return { id: c._id, count: d.assigned?.length || 0 };
          } catch {
            return { id: c._id, count: 0 };
          }
        }),
      );
      const map: Record<string, number> = {};
      enrollData.forEach(({ id, count }) => {
        map[id] = count;
      });
      setEnrollments(map);
      setLoading(false);
    })();
  }, [user]);

  /* Derived stats */
  const totalContent = useMemo(
    () =>
      courses.reduce(
        (s, c) =>
          s + c.modules.reduce((ms, m) => ms + (m.videos?.length || 0), 0),
        0,
      ),
    [courses],
  );
  const totalEnrolled = useMemo(
    () => Object.values(enrollments).reduce((a, b) => a + b, 0),
    [enrollments],
  );
  const published = courses.filter((c) => c.status === "published").length;

  /* Chart data */
  const enrollmentChartData = useMemo(
    () =>
      courses
        .map((c) => ({ label: c.title, value: enrollments[c._id] ?? 0 }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6),
    [courses, enrollments],
  );

  const maxEnrollment = Math.max(...enrollmentChartData.map((d) => d.value), 1);

  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    courses.forEach((c) => {
      const cat = c.category || "Uncategorized";
      map[cat] = (map[cat] || 0) + 1;
    });
    return Object.entries(map)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);
  }, [courses]);

  const maxCategory = Math.max(...categoryData.map((d) => d.value), 1);

  const passedCount = recentGrades.filter(
    (r) => r.passed && r.score !== null,
  ).length;
  const failedCount = recentGrades.filter(
    (r) => !r.passed && r.score !== null,
  ).length;
  const pendingCount = recentGrades.filter((r) => r.score === null).length;

  if (!user || user.role !== "admin") return null;

  return (
    <div className="space-y-8 text-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            System Overview
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Platform-wide analytics and activity
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

      {/* Stat cards */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            {
              label: "Total Courses",
              value: courses.length,
              icon: BookOpen,
              color: "from-indigo-500 to-indigo-600",
              bar: "from-indigo-500 to-indigo-600",
            },
            {
              label: "Published",
              value: published,
              icon: TrendingUp,
              color: "from-emerald-500 to-teal-600",
              bar: "from-emerald-500 to-teal-600",
            },
            {
              label: "Total Enrollments",
              value: totalEnrolled,
              icon: Users,
              color: "from-blue-500 to-cyan-600",
              bar: "from-blue-500 to-cyan-600",
            },
            {
              label: "Content Items",
              value: totalContent,
              icon: ClipboardList,
              color: "from-violet-500 to-purple-600",
              bar: "from-violet-500 to-purple-600",
            },
          ].map(({ label, value, icon: Icon, color, bar }) => (
            <div
              key={label}
              className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl transition-all hover:bg-white/[0.07] hover:-translate-y-0.5`}
            >
              <div
                className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${bar} opacity-70`}
              />
              <div className="p-5">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${color} opacity-20 mb-4`}
                />
                <div
                  className={`absolute top-5 left-5 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${color}`}
                >
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div className="mt-4">
                  <div className="text-3xl font-bold text-white tracking-tight">
                    {value}
                  </div>
                  <div className="mt-1 text-xs uppercase tracking-wider text-slate-400">
                    {label}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Charts row */}
      {!loading && (
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Enrollment by course */}
          <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
            <h2 className="text-sm font-semibold text-white mb-4">
              Enrollments by Course
            </h2>
            <BarChart
              data={enrollmentChartData}
              maxValue={maxEnrollment}
              color="from-indigo-500 to-blue-600"
            />
          </div>

          {/* Assessment pass/fail donut */}
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
            <h2 className="text-sm font-semibold text-white mb-4">
              Assessment Results
            </h2>
            <DonutChart
              passed={passedCount}
              failed={failedCount}
              pending={pendingCount}
            />
          </div>
        </div>
      )}

      {/* Category distribution */}
      {!loading && categoryData.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
          <h2 className="text-sm font-semibold text-white mb-4">
            Courses by Category
          </h2>
          <BarChart
            data={categoryData}
            maxValue={maxCategory}
            color="from-violet-500 to-purple-600"
          />
        </div>
      )}

      {/* Courses table */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">All Courses</h2>
          <Link
            href="/courses"
            className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-0.5"
          >
            View all <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.02]">
              {[
                "Course",
                "Instructor",
                "Status",
                "Enrolled",
                "Content",
                "Actions",
              ].map((h) => (
                <th
                  key={h}
                  className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRowSkeleton key={i} cols={6} />
              ))
            ) : courses.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="py-12 text-center text-sm text-slate-500"
                >
                  No courses yet.
                </td>
              </tr>
            ) : (
              courses.map((c) => {
                const contentCount = c.modules.reduce(
                  (s, m) => s + (m.videos?.length || 0),
                  0,
                );
                return (
                  <tr
                    key={c._id}
                    className="hover:bg-white/[0.03] transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-white">{c.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {c.category}
                      </p>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-400">
                      {(c.createdBy as any)?.name || "—"}
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
                    <td className="px-5 py-3.5 text-slate-300">
                      {enrollments[c._id] ?? "—"}
                    </td>
                    <td className="px-5 py-3.5 text-slate-300">
                      {contentCount}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/courses/${c._id}`}
                          className="text-xs text-slate-400 hover:text-white transition-colors"
                        >
                          View
                        </Link>
                        <Link
                          href={`/instructor/courses/${c._id}`}
                          className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                        >
                          Edit
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
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Recent submissions */}
      {!loading && recentGrades.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
          <div className="px-5 py-4 border-b border-white/10">
            <h2 className="text-sm font-semibold text-white">
              Recent Assessment Submissions
            </h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02]">
                {["Staff", "Assessment", "Score", "Result", "Date"].map((h) => (
                  <th
                    key={h}
                    className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {recentGrades.map((r) => (
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
                  <td className="px-5 py-3.5 font-semibold text-white">
                    {r.score}%
                  </td>
                  <td className="px-5 py-3.5">
                    {r.passed ? (
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-300">
                        <CheckCircle2 className="h-3 w-3" /> Passed
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-red-300">
                        <XCircle className="h-3 w-3" /> Failed
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-slate-400">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
