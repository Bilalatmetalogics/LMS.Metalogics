"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/useAuth";
import Link from "next/link";
import CourseCard from "@/components/ui/CourseCard";

/* ─── Admin quick-link card ─────────────────────────────────── */
function QuickCard({
  label,
  desc,
  href,
  icon,
}: {
  label: string;
  desc: string;
  href: string;
  icon: string;
}) {
  return (
    <Link
      href={href}
      className="group bg-white p-5 rounded-xl border border-zinc-100 hover:border-indigo-300 hover:shadow-md transition-all"
    >
      <div className="w-9 h-9 bg-indigo-50 rounded-lg flex items-center justify-center mb-3 group-hover:bg-indigo-600 group-hover:text-white transition-colors text-indigo-600">
        <span className="material-symbols-outlined text-[18px]">{icon}</span>
      </div>
      <p className="text-sm font-semibold text-zinc-900">{label}</p>
      <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">{desc}</p>
    </Link>
  );
}

/* ─── Stat pill (admin/instructor) ──────────────────────────── */
function StatPill({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex flex-col">
      <span className="text-3xl font-black text-zinc-900 tracking-tight">
        {value}
      </span>
      <span className="text-xs text-zinc-400 mt-0.5">{label}</span>
    </div>
  );
}

/* ─── Announcements ──────────────────────────────────────────── */
function Announcements({ items }: { items: any[] }) {
  return (
    <div className="bg-white rounded-xl border border-zinc-100 overflow-hidden">
      <div className="px-5 py-4 border-b border-zinc-50 flex items-center justify-between">
        <p className="text-sm font-semibold text-zinc-900">Announcements</p>
        <Link
          href="/notifications"
          className="text-xs text-indigo-600 hover:underline"
        >
          View all
        </Link>
      </div>
      {items.length === 0 ? (
        <p className="px-5 py-8 text-xs text-zinc-400 text-center">
          Nothing new.
        </p>
      ) : (
        <ul className="divide-y divide-zinc-50">
          {items.map((a: any) => (
            <li key={a._id} className="px-5 py-3.5">
              <p className="text-sm text-zinc-800 leading-snug">{a.message}</p>
              <p className="text-[11px] text-zinc-400 mt-1">
                {new Date(a.createdAt).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ─── Horizontal scroll row (Netflix style) ─────────────────── */
function CourseRow({
  title,
  courses,
  progressMap,
}: {
  title: string;
  courses: any[];
  progressMap: Record<string, number>;
}) {
  if (!courses.length) return null;
  return (
    <section>
      <h2 className="text-base font-semibold text-zinc-900 mb-3">{title}</h2>
      <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
        {courses.map((c: any) => (
          <div key={c._id} className="w-64 shrink-0">
            <CourseCard
              id={c._id}
              title={c.title}
              description={c.description}
              category={c.category}
              pct={progressMap[c._id]}
              href={`/courses/${c._id}`}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── Main ───────────────────────────────────────────────────── */
export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [announcements, setAnnouncements] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    async function load() {
      const [coursesRes, notifRes] = await Promise.all([
        fetch("/api/courses"),
        fetch("/api/notifications"),
      ]);
      const courses = coursesRes.ok ? await coursesRes.json() : [];
      const notifs = notifRes.ok ? await notifRes.json() : [];
      setAnnouncements(
        notifs.filter((n: any) => n.type === "announcement").slice(0, 4),
      );

      if (user!.role === "admin") {
        const usersRes = await fetch("/api/users");
        const users = usersRes.ok ? await usersRes.json() : [];
        setData({
          activeUsers: users.filter((u: any) => u.isActive).length,
          publishedCourses: courses.filter((c: any) => c.status === "published")
            .length,
          totalCourses: courses.length,
        });
      } else if (user!.role === "instructor") {
        let enrolledCount = 0;
        for (const c of courses) {
          try {
            const r = await fetch(`/api/courses/${c._id}/assign`);
            if (r.ok) {
              const { assigned } = await r.json();
              enrolledCount += assigned?.length || 0;
            }
          } catch {}
        }
        setData({ myCourses: courses, enrolledCount });
      } else {
        // Student
        const progressRes = await Promise.all(
          courses.map((c: any) =>
            fetch(`/api/progress?courseId=${c._id}`).then((r) =>
              r.ok ? r.json() : [],
            ),
          ),
        );
        const progressMap: Record<string, number> = {};
        courses.forEach((c: any, i: number) => {
          const allVideos = c.modules?.flatMap((m: any) => m.videos) || [];
          const completed = progressRes[i].filter(
            (p: any) => p.completed,
          ).length;
          progressMap[c._id] = allVideos.length
            ? Math.round((completed / allVideos.length) * 100)
            : 0;
        });

        const [assessmentsRes, gradesRes] = await Promise.all([
          fetch("/api/assessments"),
          fetch("/api/grades"),
        ]);
        const assessments = assessmentsRes.ok
          ? await assessmentsRes.json()
          : [];
        const grades = gradesRes.ok ? await gradesRes.json() : [];
        const enrolledIds = new Set(courses.map((c: any) => c._id));
        const gradedIds = new Set(
          grades.map((r: any) => r.assessmentId?._id || r.assessmentId),
        );
        const pending = assessments.filter(
          (a: any) => enrolledIds.has(a.courseId) && !gradedIds.has(a._id),
        );

        setData({ courses, progressMap, pending });
      }
    }
    load();
  }, [user]);

  if (!user || !data) return null;

  const firstName = user.name.split(" ")[0];

  /* ── ADMIN ── */
  if (user.role === "admin") {
    return (
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Hero */}
        <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 p-8 text-white relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-48 h-48 bg-white/5 rounded-full" />
          <div className="absolute -bottom-12 -left-6 w-40 h-40 bg-black/10 rounded-full" />
          <p className="text-indigo-200 text-xs font-semibold uppercase tracking-widest mb-1">
            Admin Console
          </p>
          <h1 className="text-3xl font-black tracking-tight mb-1">
            Welcome back, {firstName}.
          </h1>
          <p className="text-indigo-200 text-sm">
            Here's your platform at a glance.
          </p>
          <div className="flex gap-8 mt-6">
            <StatPill label="Active Users" value={data.activeUsers} />
            <div className="w-px bg-white/20" />
            <StatPill label="Published" value={data.publishedCourses} />
            <div className="w-px bg-white/20" />
            <StatPill label="Total Courses" value={data.totalCourses} />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <p className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">
              Quick Actions
            </p>
            <div className="grid sm:grid-cols-3 gap-3">
              <QuickCard
                label="System Overview"
                desc="Courses, enrollments, activity"
                href="/admin/overview"
                icon="analytics"
              />
              <QuickCard
                label="Manage Users"
                desc="Create and manage accounts"
                href="/admin/users"
                icon="manage_accounts"
              />
              <QuickCard
                label="Grade Book"
                desc="Review assessment results"
                href="/instructor/grades"
                icon="grade"
              />
            </div>
          </div>
          <Announcements items={announcements} />
        </div>
      </div>
    );
  }

  /* ── INSTRUCTOR ── */
  if (user.role === "instructor") {
    return (
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Hero */}
        <div className="rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-8 text-white relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-48 h-48 bg-white/5 rounded-full" />
          <div className="absolute -bottom-12 -left-6 w-40 h-40 bg-indigo-600/20 rounded-full" />
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-1">
            Instructor
          </p>
          <h1 className="text-3xl font-black tracking-tight mb-1">
            Welcome back, {firstName}.
          </h1>
          <p className="text-slate-400 text-sm">
            Manage your courses and track learner progress.
          </p>
          <div className="flex gap-8 mt-6">
            <StatPill label="My Courses" value={data.myCourses?.length || 0} />
            <div className="w-px bg-white/20" />
            <StatPill label="Enrolled Staff" value={data.enrolledCount || 0} />
          </div>
          <Link
            href="/instructor/courses/new"
            className="absolute top-6 right-6 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            New Course
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Course list */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-zinc-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-50 flex items-center justify-between">
              <p className="text-sm font-semibold text-zinc-900">My Courses</p>
              <Link
                href="/instructor/courses"
                className="text-xs text-indigo-600 hover:underline"
              >
                View all
              </Link>
            </div>
            <ul className="divide-y divide-zinc-50">
              {(data.myCourses || []).slice(0, 6).map((c: any) => (
                <li
                  key={c._id}
                  className="px-5 py-3.5 flex items-center justify-between hover:bg-zinc-50 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-zinc-900">
                      {c.title}
                    </p>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {c.modules?.length || 0} modules · {c.category}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${c.status === "published" ? "bg-emerald-50 text-emerald-700" : "bg-zinc-100 text-zinc-500"}`}
                    >
                      {c.status}
                    </span>
                    <Link
                      href={`/instructor/courses/${c._id}`}
                      className="text-xs text-indigo-600 hover:underline font-medium"
                    >
                      Edit →
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <Announcements items={announcements} />
        </div>
      </div>
    );
  }

  /* ── STUDENT ── */
  const { courses, progressMap, pending } = data;
  const inProgress = courses.filter(
    (c: any) => progressMap[c._id] > 0 && progressMap[c._id] < 100,
  );
  const notStarted = courses.filter(
    (c: any) => !progressMap[c._id] || progressMap[c._id] === 0,
  );
  const completed = courses.filter((c: any) => progressMap[c._id] === 100);

  // Pick the most-recently-in-progress course for the hero
  const heroCard = inProgress[0] || notStarted[0];

  return (
    <div className="space-y-10">
      {/* Hero banner */}
      {heroCard && (
        <div className="rounded-2xl overflow-hidden relative h-52 bg-gradient-to-br from-indigo-700 via-violet-700 to-purple-800 flex items-end">
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="relative z-10 p-8 w-full flex items-end justify-between">
            <div>
              <p className="text-indigo-300 text-xs font-semibold uppercase tracking-widest mb-1">
                {inProgress.length > 0 ? "Continue Learning" : "Start Here"}
              </p>
              <h1 className="text-2xl font-black text-white tracking-tight leading-tight max-w-lg">
                {heroCard.title}
              </h1>
              {progressMap[heroCard._id] > 0 && (
                <p className="text-white/60 text-sm mt-1">
                  {progressMap[heroCard._id]}% complete
                </p>
              )}
            </div>
            <Link
              href={`/courses/${heroCard._id}/learn`}
              className="shrink-0 flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-700 font-bold text-sm rounded-full hover:bg-indigo-50 transition-colors shadow-lg"
            >
              <svg
                className="w-4 h-4 ml-0.5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
              {inProgress.length > 0 ? "Continue" : "Start"}
            </Link>
          </div>
          {/* Progress bar at bottom of hero */}
          {progressMap[heroCard._id] > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
              <div
                className="h-full bg-indigo-400 transition-all"
                style={{ width: `${progressMap[heroCard._id]}%` }}
              />
            </div>
          )}
        </div>
      )}

      {/* Pending assessments strip */}
      {pending.length > 0 && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <span className="material-symbols-outlined text-amber-600 text-[20px]">
            quiz
          </span>
          <p className="text-sm text-amber-800 font-medium flex-1">
            You have <strong>{pending.length}</strong> pending assessment
            {pending.length > 1 ? "s" : ""}.
          </p>
          <div className="flex gap-2 flex-wrap">
            {pending.slice(0, 2).map((a: any) => (
              <Link
                key={a._id}
                href={`/courses/${a.courseId}/assessment/${a._id}`}
                className="text-xs font-semibold text-amber-700 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition-colors"
              >
                {a.title} →
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Course rows */}
      <CourseRow
        title="Continue Learning"
        courses={inProgress}
        progressMap={progressMap}
      />
      <CourseRow
        title="Not Started Yet"
        courses={notStarted}
        progressMap={progressMap}
      />
      <CourseRow
        title="Completed"
        courses={completed}
        progressMap={progressMap}
      />

      {courses.length === 0 && (
        <div className="text-center py-20">
          <span className="material-symbols-outlined text-zinc-200 text-[64px]">
            school
          </span>
          <p className="text-zinc-400 text-sm mt-3">No courses assigned yet.</p>
        </div>
      )}
    </div>
  );
}
