"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/useAuth";
import {
  StatCardSkeleton,
  HeroBannerSkeleton,
  CourseRowSkeleton,
  QuickCardSkeleton,
  TableRowSkeleton,
} from "@/components/ui/skeleton";
import {
  BookOpen,
  Users,
  GraduationCap,
  Bell,
  TrendingUp,
  Clock,
  Award,
  ChevronRight,
  Play,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  FileText,
  BarChart3,
  Settings,
  Plus,
  ArrowRight,
} from "lucide-react";

/* ── Types ──────────────────────────────────────────────────── */
type Course = {
  _id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  category?: string;
  status?: "draft" | "published";
  modules?: { videos: any[] }[];
  progress?: number;
  enrolledCount?: number;
};

type Notification = {
  _id: string;
  message: string;
  type: string;
  read?: boolean;
  createdAt: string;
};

type Assessment = {
  _id: string;
  title: string;
  courseId: string;
};

/* ── Stat card ──────────────────────────────────────────────── */
type StatColor = "indigo" | "emerald" | "amber" | "rose" | "violet" | "blue";

const statColorMap: Record<
  StatColor,
  {
    border: string;
    glow: string;
    iconBg: string;
    iconText: string;
    topBar: string;
  }
> = {
  indigo: {
    border: "hover:border-indigo-400/40",
    glow: "from-indigo-500/15",
    iconBg: "from-indigo-500/25 to-indigo-600/15 border-indigo-400/25",
    iconText: "text-indigo-300",
    topBar: "from-indigo-500 to-indigo-600",
  },
  emerald: {
    border: "hover:border-emerald-400/40",
    glow: "from-emerald-500/15",
    iconBg: "from-emerald-500/25 to-emerald-600/15 border-emerald-400/25",
    iconText: "text-emerald-300",
    topBar: "from-emerald-500 to-teal-600",
  },
  amber: {
    border: "hover:border-amber-400/40",
    glow: "from-amber-500/15",
    iconBg: "from-amber-500/25 to-amber-600/15 border-amber-400/25",
    iconText: "text-amber-300",
    topBar: "from-amber-500 to-orange-500",
  },
  rose: {
    border: "hover:border-rose-400/40",
    glow: "from-rose-500/15",
    iconBg: "from-rose-500/25 to-rose-600/15 border-rose-400/25",
    iconText: "text-rose-300",
    topBar: "from-rose-500 to-pink-600",
  },
  violet: {
    border: "hover:border-violet-400/40",
    glow: "from-violet-500/15",
    iconBg: "from-violet-500/25 to-violet-600/15 border-violet-400/25",
    iconText: "text-violet-300",
    topBar: "from-violet-500 to-purple-600",
  },
  blue: {
    border: "hover:border-blue-400/40",
    glow: "from-blue-500/15",
    iconBg: "from-blue-500/25 to-blue-600/15 border-blue-400/25",
    iconText: "text-blue-300",
    topBar: "from-blue-500 to-cyan-600",
  },
};

function StatCard({
  label,
  value,
  delta,
  icon: Icon,
  color = "indigo",
}: {
  label: string;
  value: string | number;
  delta?: string;
  icon: React.ElementType;
  color?: StatColor;
}) {
  const c = statColorMap[color];
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl transition-all hover:bg-white/[0.07] hover:-translate-y-0.5 hover:shadow-xl ${c.border}`}
    >
      {/* Colored top accent bar */}
      <div
        className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${c.topBar} opacity-70`}
      />

      {/* Hover glow */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${c.glow} via-transparent to-transparent opacity-0 transition group-hover:opacity-100`}
      />

      <div className="relative p-5">
        <div className="flex items-center justify-between">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br border ${c.iconBg}`}
          >
            <Icon className={`h-5 w-5 ${c.iconText}`} />
          </div>
          {delta && (
            <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
              <TrendingUp className="h-3 w-3" />
              {delta}
            </span>
          )}
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
  );
}

/* ── Quick action card (admin) ──────────────────────────────── */
function QuickCard({
  label,
  desc,
  href,
  icon: Icon,
}: {
  label: string;
  desc: string;
  href: string;
  icon: React.ElementType;
}) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl transition hover:border-indigo-400/40 hover:bg-white/[0.08] hover:-translate-y-0.5"
    >
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-indigo-500/10 blur-2xl transition group-hover:bg-indigo-400/20" />
      <div className="relative">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-lg">
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="mt-4 font-semibold text-white">{label}</h3>
        <p className="mt-1 text-xs leading-relaxed text-slate-400">{desc}</p>
        <div className="mt-3 flex items-center gap-1 text-xs font-medium text-indigo-300 opacity-0 transition group-hover:opacity-100">
          Open <ChevronRight className="h-3 w-3" />
        </div>
      </div>
    </Link>
  );
}

/* ── Course tile ────────────────────────────────────────────── */
function CourseTile({ course }: { course: Course }) {
  return (
    <Link
      href={`/courses/${course._id}`}
      className="group relative flex-shrink-0 w-64 sm:w-72 overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl transition hover:border-indigo-400/40 hover:-translate-y-1 hover:shadow-2xl"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-indigo-900 via-blue-900 to-violet-900">
        {course.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={course.thumbnail}
            alt={course.title}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <BookOpen className="h-10 w-10 text-white/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 backdrop-blur">
            <Play className="h-5 w-5 fill-slate-900 text-slate-900 ml-0.5" />
          </div>
        </div>
        {course.category && (
          <span className="absolute top-3 left-3 rounded-full bg-slate-950/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-indigo-300 backdrop-blur">
            {course.category}
          </span>
        )}
      </div>
      {/* Body */}
      <div className="p-4">
        <h3 className="line-clamp-1 font-semibold text-white group-hover:text-indigo-300 transition">
          {course.title}
        </h3>
        {typeof course.progress === "number" && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-[10px] font-medium text-slate-400">
              <span>Progress</span>
              <span className="text-indigo-300">{course.progress}%</span>
            </div>
            <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 transition-all"
                style={{ width: `${course.progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}

/* ── Course row (horizontal scroll) ────────────────────────── */
function CourseRow({ title, courses }: { title: string; courses: Course[] }) {
  if (courses.length === 0) return null;
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
      <div className="-mx-8 px-8 overflow-x-auto scrollbar-hide">
        <div className="flex gap-4 pb-4">
          {courses.map((c) => (
            <CourseTile key={c._id} course={c} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Hero (student continue learning) ───────────────────────── */
function ContinueLearningHero({ course }: { course: Course }) {
  return (
    <Link
      href={`/courses/${course._id}/learn`}
      className="group relative block overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl"
    >
      <div className="absolute inset-0">
        {course.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={course.thumbnail}
            alt=""
            className="h-full w-full object-cover transition duration-1000 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-indigo-900 via-blue-900 to-violet-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-slate-950/20" />
      </div>
      <div className="relative grid gap-6 p-8 sm:p-10 lg:grid-cols-[1.5fr_1fr] lg:items-center">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-indigo-300">
            <Sparkles className="h-3 w-3" /> Continue learning
          </span>
          <h1 className="mt-4 text-3xl sm:text-4xl font-bold text-white tracking-tight leading-tight">
            {course.title}
          </h1>
          {course.description && (
            <p className="mt-3 max-w-xl text-sm text-slate-300 line-clamp-2">
              {course.description}
            </p>
          )}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg">
              <Play className="h-4 w-4 fill-current" />
              Resume
            </span>
            <span className="text-xs text-slate-400">
              {course.progress ?? 0}% complete
            </span>
          </div>
        </div>
        <div className="hidden lg:block">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
            <div className="flex items-center justify-between text-xs uppercase tracking-wider text-slate-400">
              <span>Your progress</span>
              <span className="text-indigo-300 font-bold">
                {course.progress ?? 0}%
              </span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-400 via-blue-500 to-violet-500 transition-all"
                style={{ width: `${course.progress ?? 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ── Empty state ────────────────────────────────────────────── */
function EmptyState({
  icon: Icon,
  title,
  message,
  cta,
}: {
  icon: React.ElementType;
  title: string;
  message: string;
  cta?: { label: string; href: string };
}) {
  return (
    <div className="rounded-3xl border border-dashed border-white/15 bg-white/5 p-12 text-center backdrop-blur-xl">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 to-blue-600/20 border border-indigo-400/20">
        <Icon className="h-6 w-6 text-indigo-300" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
      <p className="mt-1 text-sm text-slate-400 max-w-sm mx-auto">{message}</p>
      {cta && (
        <Link
          href={cta.href}
          className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          {cta.label}
        </Link>
      )}
    </div>
  );
}

/* ── Pending assessments banner ─────────────────────────────── */
function PendingBanner({ pending }: { pending: Assessment[] }) {
  if (pending.length === 0) return null;
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-amber-400/30 bg-amber-500/10 p-4 backdrop-blur-xl">
      <AlertCircle className="h-5 w-5 text-amber-300 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white">
          {pending.length} pending assessment{pending.length > 1 ? "s" : ""}
        </p>
        <p className="text-xs text-slate-300 truncate mt-0.5">
          {pending
            .slice(0, 2)
            .map((p) => p.title)
            .join(" · ")}
        </p>
      </div>
      <div className="flex gap-2 shrink-0">
        {pending.slice(0, 2).map((a) => (
          <Link
            key={a._id}
            href={`/courses/${a.courseId}/assessment/${a._id}`}
            className="text-xs font-semibold text-amber-300 bg-amber-500/20 hover:bg-amber-500/30 px-3 py-1.5 rounded-lg transition"
          >
            {a.title} →
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ── Main page ──────────────────────────────────────────────── */
export default function DashboardPage() {
  const { user, status } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pending, setPending] = useState<Assessment[]>([]);
  const [userCount, setUserCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    (async () => {
      try {
        const [cRes, nRes] = await Promise.all([
          fetch("/api/courses").then((r) => (r.ok ? r.json() : [])),
          fetch("/api/notifications").then((r) => (r.ok ? r.json() : [])),
        ]);
        if (cancelled) return;

        const courseList: Course[] = Array.isArray(cRes) ? cRes : [];
        const notifList: Notification[] = Array.isArray(nRes) ? nRes : [];
        setCourses(courseList);
        setNotifications(notifList);

        // Admin: fetch user count
        if (user.role === "admin") {
          const uRes = await fetch("/api/users").then((r) =>
            r.ok ? r.json() : [],
          );
          if (!cancelled) setUserCount(Array.isArray(uRes) ? uRes.length : 0);
        }

        // Student: compute progress per course + pending assessments
        if (user.role === "student") {
          const progressResults = await Promise.all(
            courseList.map((c) =>
              fetch(`/api/progress?courseId=${c._id}`).then((r) =>
                r.ok ? r.json() : [],
              ),
            ),
          );
          if (cancelled) return;

          const withProgress = courseList.map((c, i) => {
            const allVideos = c.modules?.flatMap((m) => m.videos) ?? [];
            const completed = (progressResults[i] as any[]).filter(
              (p: any) => p.completed,
            ).length;
            return {
              ...c,
              progress: allVideos.length
                ? Math.round((completed / allVideos.length) * 100)
                : 0,
            };
          });
          setCourses(withProgress);

          // Pending assessments
          const [aRes, gRes] = await Promise.all([
            fetch("/api/assessments").then((r) => (r.ok ? r.json() : [])),
            fetch("/api/grades").then((r) => (r.ok ? r.json() : [])),
          ]);
          if (cancelled) return;
          const assessments: Assessment[] = Array.isArray(aRes) ? aRes : [];
          const grades: any[] = Array.isArray(gRes) ? gRes : [];
          const enrolledIds = new Set(courseList.map((c) => c._id));
          const gradedIds = new Set(
            grades.map((r) => r.assessmentId?._id || r.assessmentId),
          );
          setPending(
            assessments.filter(
              (a) => enrolledIds.has(a.courseId) && !gradedIds.has(a._id),
            ),
          );
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  /* Derived */
  const inProgress = courses.filter(
    (c) => (c.progress ?? 0) > 0 && (c.progress ?? 0) < 100,
  );
  const notStarted = courses.filter((c) => !c.progress || c.progress === 0);
  const completed = courses.filter((c) => (c.progress ?? 0) >= 100);
  const currentCourse = inProgress[0] ?? notStarted[0];
  const unreadCount = notifications.filter((n) => !n.read).length;
  const publishedCourses = courses.filter((c) => c.status === "published");
  const totalEnrollments = courses.reduce(
    (s, c) => s + (c.enrolledCount ?? 0),
    0,
  );

  const firstName = user?.name?.split(" ")[0] ?? "there";

  if (status === "loading" || loading) {
    return (
      <div className="space-y-10 text-white">
        <HeroBannerSkeleton />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
        <section className="space-y-5">
          <div className="space-y-2">
            <div className="h-3 w-24 rounded bg-white/8 animate-pulse" />
            <div className="h-7 w-40 rounded bg-white/8 animate-pulse" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <QuickCardSkeleton key={i} />
            ))}
          </div>
        </section>
        <CourseRowSkeleton count={3} />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="space-y-10 text-white">
      {/* ── Hero greeting banner ── */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 p-8 sm:p-10">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-8 h-48 w-48 rounded-full bg-violet-500/15 blur-3xl" />
        {/* Grid overlay */}
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-20 rounded-3xl" />

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          {/* Left: text */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-indigo-300">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
              Welcome back,{" "}
              <span className="bg-gradient-to-r from-indigo-300 via-blue-300 to-violet-300 bg-clip-text text-transparent">
                {firstName}
              </span>
            </h1>
            <p className="mt-2 text-sm text-slate-400 max-w-md">
              {user.role === "admin"
                ? "Here's what's happening across your learning platform today."
                : user.role === "instructor"
                  ? "Track your courses and learner progress at a glance."
                  : "Pick up where you left off, or explore something new."}
            </p>
          </div>

          {/* Right: role badge + quick stat */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-center backdrop-blur min-w-[100px]">
              <div className="text-2xl font-bold text-white">
                {user.role === "admin"
                  ? userCount
                  : user.role === "instructor"
                    ? courses.length
                    : courses.length}
              </div>
              <div className="mt-0.5 text-[10px] uppercase tracking-wider text-slate-400">
                {user.role === "admin"
                  ? "Users"
                  : user.role === "instructor"
                    ? "Courses"
                    : "Enrolled"}
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-center backdrop-blur min-w-[100px]">
              <div className="text-2xl font-bold text-white">
                {user.role === "admin"
                  ? publishedCourses.length
                  : user.role === "instructor"
                    ? totalEnrollments
                    : inProgress.length}
              </div>
              <div className="mt-0.5 text-[10px] uppercase tracking-wider text-slate-400">
                {user.role === "admin"
                  ? "Published"
                  : user.role === "instructor"
                    ? "Learners"
                    : "In Progress"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── ADMIN ── */}
      {user.role === "admin" && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Active Users"
              value={userCount}
              icon={Users}
              color="indigo"
            />
            <StatCard
              label="Total Courses"
              value={courses.length}
              icon={BookOpen}
              color="blue"
            />
            <StatCard
              label="Published"
              value={publishedCourses.length}
              icon={CheckCircle2}
              color="emerald"
            />
            <StatCard
              label="Unread Alerts"
              value={unreadCount}
              icon={Bell}
              color="rose"
            />
          </div>

          <section className="space-y-5">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-indigo-300/80">
                Administration
              </p>
              <h2 className="mt-1 text-2xl font-bold text-white">
                Quick actions
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <QuickCard
                label="Manage Users"
                desc="Roles, access & permissions"
                href="/admin/users"
                icon={Users}
              />
              <QuickCard
                label="Courses"
                desc="Create, edit & publish content"
                href="/instructor/courses"
                icon={BookOpen}
              />
              <QuickCard
                label="Analytics"
                desc="Engagement & performance"
                href="/admin/overview"
                icon={BarChart3}
              />
              <QuickCard
                label="Grade Book"
                desc="Review assessment results"
                href="/instructor/grades"
                icon={FileText}
              />
            </div>
          </section>

          <CourseRow title="All courses" courses={courses.slice(0, 8)} />
        </>
      )}

      {/* ── INSTRUCTOR ── */}
      {user.role === "instructor" && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              label="My Courses"
              value={courses.length}
              icon={BookOpen}
              color="indigo"
            />
            <StatCard
              label="Total Learners"
              value={totalEnrollments}
              icon={Users}
              color="blue"
            />
            <StatCard
              label="Avg. Completion"
              value="74%"
              icon={Award}
              color="emerald"
            />
          </div>

          <section className="space-y-5">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-indigo-300/80">
                  Your content
                </p>
                <h2 className="mt-1 text-2xl font-bold text-white">
                  Course management
                </h2>
              </div>
              <Link
                href="/instructor/courses/new"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:opacity-90"
              >
                <Plus className="h-4 w-4" />
                New course
              </Link>
            </div>

            {courses.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title="No courses yet"
                message="Create your first course to start sharing knowledge with learners."
                cta={{
                  label: "Create course",
                  href: "/instructor/courses/new",
                }}
              />
            ) : (
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10 text-left text-[10px] uppercase tracking-wider text-slate-400">
                      <th className="px-5 py-3 font-semibold">Course</th>
                      <th className="px-5 py-3 font-semibold">Status</th>
                      <th className="px-5 py-3 font-semibold">Learners</th>
                      <th className="px-5 py-3 font-semibold" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {courses.map((c) => (
                      <tr
                        key={c._id}
                        className="text-sm hover:bg-white/[0.03] transition"
                      >
                        <td className="px-5 py-4">
                          <div className="font-medium text-white">
                            {c.title}
                          </div>
                          {c.category && (
                            <div className="text-xs text-slate-500 mt-0.5">
                              {c.category}
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider border ${
                              c.status === "published"
                                ? "bg-emerald-500/15 text-emerald-300 border-emerald-400/30"
                                : "bg-amber-500/15 text-amber-300 border-amber-400/30"
                            }`}
                          >
                            {c.status ?? "draft"}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-slate-300">
                          {c.enrolledCount ?? 0}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <Link
                            href={`/instructor/courses/${c._id}`}
                            className="inline-flex items-center gap-1 text-xs font-medium text-indigo-300 hover:text-indigo-200 transition"
                          >
                            Manage <ChevronRight className="h-3 w-3" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}

      {/* ── STUDENT ── */}
      {user.role === "student" && (
        <>
          <PendingBanner pending={pending} />

          {currentCourse && <ContinueLearningHero course={currentCourse} />}

          <CourseRow title="In progress" courses={inProgress} />
          <CourseRow title="Up next" courses={notStarted} />
          <CourseRow title="Completed" courses={completed} />

          {courses.length === 0 && (
            <EmptyState
              icon={GraduationCap}
              title="No courses assigned yet"
              message="Once an instructor enrolls you in a course, it'll show up here."
            />
          )}
        </>
      )}
    </div>
  );
}
