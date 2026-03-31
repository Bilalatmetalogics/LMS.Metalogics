"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/useAuth";
import Link from "next/link";
import { ProgressBar } from "@/components/ui/progress-bar";

/* ── Shared stat card ─────────────────────────────────────────── */
function StatCard({
  label,
  value,
  icon,
  accent = "primary",
  sub,
}: {
  label: string;
  value: number | string;
  icon: string;
  accent?: "primary" | "tertiary";
  sub?: string;
}) {
  const isTertiary = accent === "tertiary";
  return (
    <div className="bg-white p-6 rounded-xl relative overflow-hidden group border border-[#c7c4d8]/10 shadow-sm">
      <div
        className={`absolute -right-4 -top-4 w-24 h-24 rounded-full group-hover:scale-125 transition-transform duration-500 ${isTertiary ? "bg-[#7e3000]/5" : "bg-[#3525cd]/5"}`}
      />
      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">
        {label}
      </p>
      <div className="flex items-end justify-between">
        <h3
          className={`text-5xl font-black tracking-tighter ${isTertiary ? "text-[#7e3000]" : "text-[#3525cd]"}`}
        >
          {value}
        </h3>
        <span
          className={`material-symbols-outlined opacity-20 text-[48px] ${isTertiary ? "text-[#7e3000]" : "text-[#3525cd]"}`}
        >
          {icon}
        </span>
      </div>
      {sub && (
        <p
          className={`text-[11px] font-bold mt-2 ${isTertiary ? "text-[#7e3000]" : "text-[#3525cd]"}`}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

/* ── Announcements panel (shared) ─────────────────────────────── */
function AnnouncementsPanel({ items }: { items: any[] }) {
  return (
    <div className="bg-[#f4f2fd] p-6 rounded-xl flex-1 border border-[#c7c4d8]/10">
      <div className="flex items-center justify-between mb-6">
        <h4 className="font-bold text-[#1a1b22]">Announcements</h4>
        <Link
          href="/notifications"
          className="text-[10px] font-black text-[#3525cd] uppercase tracking-widest hover:underline"
        >
          View All
        </Link>
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-zinc-400 text-center py-6">
          No announcements yet.
        </p>
      ) : (
        <div className="space-y-5">
          {items.map((a: any) => (
            <div
              key={a._id}
              className="relative pl-5 before:absolute before:left-0 before:top-1 before:bottom-1 before:w-[2px] before:bg-[#4f46e5]"
            >
              <p className="text-[10px] text-zinc-400 mb-0.5">
                {new Date(a.createdAt).toLocaleDateString()}
              </p>
              <h5 className="text-sm font-bold leading-snug text-[#1a1b22]">
                {a.message}
              </h5>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Quick link card ──────────────────────────────────────────── */
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
      className="group bg-white p-6 rounded-xl border-2 border-transparent hover:border-[#3525cd] transition-all cursor-pointer"
    >
      <div className="w-10 h-10 bg-zinc-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-[#3525cd] group-hover:text-white transition-colors text-zinc-600">
        <span className="material-symbols-outlined text-[20px]">{icon}</span>
      </div>
      <h4 className="font-bold text-[#1a1b22] mb-1 text-sm">{label}</h4>
      <p className="text-xs text-zinc-500 leading-relaxed">{desc}</p>
    </Link>
  );
}

/* ── Main page ────────────────────────────────────────────────── */
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
        notifs.filter((n: any) => n.type === "announcement").slice(0, 3),
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
        const progressRes = await Promise.all(
          courses.map((c: any) =>
            fetch(`/api/progress?courseId=${c._id}`).then((r) =>
              r.ok ? r.json() : [],
            ),
          ),
        );
        const courseProgress = courses.map((course: any, i: number) => {
          const allVideos = course.modules?.flatMap((m: any) => m.videos) || [];
          const completed = progressRes[i].filter(
            (p: any) => p.completed,
          ).length;
          return {
            course,
            completed,
            total: allVideos.length,
            pct: allVideos.length
              ? Math.round((completed / allVideos.length) * 100)
              : 0,
          };
        });
        const [assessmentsRes, gradesRes] = await Promise.all([
          fetch("/api/assessments"),
          fetch("/api/grades"),
        ]);
        const assessments = assessmentsRes.ok
          ? await assessmentsRes.json()
          : [];
        const grades = gradesRes.ok ? await gradesRes.json() : [];
        const enrolledCourseIds = new Set(courses.map((c: any) => c._id));
        const gradedIds = new Set(
          grades.map((r: any) => r.assessmentId?._id || r.assessmentId),
        );
        const pending = assessments.filter(
          (a: any) =>
            enrolledCourseIds.has(a.courseId) && !gradedIds.has(a._id),
        );
        setData({ courseProgress, pending });
      }
    }
    load();
  }, [user]);

  if (!user || !data) return null;

  const firstName = user.name.split(" ")[0];

  /* ── ADMIN ── */
  if (user.role === "admin") {
    return (
      <div className="max-w-5xl mx-auto space-y-10">
        <header>
          <h1 className="text-4xl font-black tracking-tight text-[#1a1b22] mb-1">
            Welcome back, {firstName}.
          </h1>
          <p className="text-zinc-500 font-medium">
            Here&apos;s what&apos;s happening today across your learning
            ecosystem.
          </p>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatCard
            label="Active Users"
            value={data.activeUsers}
            icon="person"
            sub="+12.5% this month"
          />
          <StatCard
            label="Published Courses"
            value={data.publishedCourses}
            icon="book"
            sub="All systems live"
          />
          <StatCard
            label="Total Courses"
            value={data.totalCourses}
            icon="library_books"
            sub={`${data.totalCourses - data.publishedCourses} in draft`}
          />
        </div>

        {/* Quick links + announcements */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <section className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-extrabold tracking-tight text-[#1a1b22]">
                Quick Management
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <QuickCard
                label="System Overview"
                desc="Configure global instance settings."
                href="/admin/overview"
                icon="settings_suggest"
              />
              <QuickCard
                label="Manage Users"
                desc="Audit roles and permissions."
                href="/admin/users"
                icon="manage_accounts"
              />
              <QuickCard
                label="Grade Book"
                desc="Assess student performance data."
                href="/instructor/grades"
                icon="grade"
              />
            </div>
          </section>
          <section>
            <AnnouncementsPanel items={announcements} />
          </section>
        </div>
      </div>
    );
  }

  /* ── INSTRUCTOR ── */
  if (user.role === "instructor") {
    return (
      <div className="max-w-5xl mx-auto space-y-10">
        <header className="flex items-end justify-between">
          <div>
            <p className="text-[#3525cd] font-bold tracking-[0.2em] text-[10px] uppercase mb-1">
              Architecture of Learning
            </p>
            <h1 className="text-4xl font-extrabold tracking-tight text-[#1a1b22]">
              Welcome back, {firstName}.
            </h1>
          </div>
          <Link
            href="/instructor/courses/new"
            className="px-5 py-2.5 signature-gradient text-white rounded-lg font-semibold text-sm shadow-lg shadow-[#4f46e5]/20 active:scale-95 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">
              add_circle
            </span>
            Create New Course
          </Link>
        </header>

        <div className="grid grid-cols-12 gap-8">
          {/* Left column */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
            <StatCard
              label="My Courses"
              value={data.myCourses?.length || 0}
              icon="menu_book"
              sub="+2 this month"
            />
            <StatCard
              label="Enrolled Staff"
              value={data.enrolledCount || 0}
              icon="badge"
              sub="Active Learners"
            />
            <AnnouncementsPanel items={announcements} />
          </div>

          {/* Courses list */}
          <div className="col-span-12 lg:col-span-8">
            <div className="bg-white rounded-xl border border-[#c7c4d8]/10 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-[#eeedf7]">
                <h3 className="text-xl font-bold text-[#1a1b22]">My Courses</h3>
                <p className="text-sm text-zinc-500">
                  Manage and update your active learning modules.
                </p>
              </div>
              <div className="divide-y divide-[#eeedf7]">
                {(data.myCourses || []).slice(0, 6).map((c: any) => (
                  <div
                    key={c._id}
                    className="p-5 flex items-center justify-between hover:bg-[#f4f2fd] transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-lg bg-[#e2dfff] flex items-center justify-center text-[#3525cd]">
                        <span className="material-symbols-outlined text-[20px]">
                          terminal
                        </span>
                      </div>
                      <div>
                        <h4 className="font-bold text-[#1a1b22]">{c.title}</h4>
                        <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">
                          {c.modules?.length || 0} Modules
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <span
                        className={`px-3 py-1 text-[10px] font-black uppercase rounded-full tracking-widest ${
                          c.status === "published"
                            ? "bg-[#e2dfff] text-[#3525cd] border border-[#c3c0ff]"
                            : "bg-zinc-100 text-zinc-500"
                        }`}
                      >
                        {c.status}
                      </span>
                      <Link
                        href={`/instructor/courses/${c._id}`}
                        className="flex items-center gap-1 text-[#3525cd] font-bold text-sm group-hover:translate-x-1 transition-transform"
                      >
                        Edit
                        <span className="material-symbols-outlined text-[18px]">
                          arrow_forward
                        </span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
              {(data.myCourses?.length || 0) > 6 && (
                <div className="p-5 bg-[#f4f2fd] flex justify-center">
                  <Link
                    href="/instructor/courses"
                    className="text-zinc-500 font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:text-[#3525cd] transition-colors"
                  >
                    View All Courses
                    <span className="material-symbols-outlined text-[16px]">
                      expand_more
                    </span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── STUDENT ── */
  return (
    <div className="max-w-5xl mx-auto space-y-10">
      <header>
        <h1 className="text-4xl font-black tracking-tight text-[#1a1b22] mb-1">
          Welcome back, {firstName}.
        </h1>
        <p className="text-zinc-500 font-medium">
          {data.pending?.length > 0
            ? `You have ${data.pending.length} pending assessment${data.pending.length > 1 ? "s" : ""} that require your attention today.`
            : "You're all caught up. Keep learning!"}
        </p>
      </header>

      <div className="grid grid-cols-12 gap-6">
        {/* Left column */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          <StatCard
            label="Active Courses"
            value={String(data.courseProgress?.length || 0).padStart(2, "0")}
            icon="auto_stories"
          />
          <StatCard
            label="Assessments"
            value={String(data.pending?.length || 0).padStart(2, "0")}
            icon="quiz"
            accent="tertiary"
          />
          <AnnouncementsPanel items={announcements} />
        </div>

        {/* Right column */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
          {/* Progress panel */}
          <div className="bg-white rounded-xl p-8 border border-[#c7c4d8]/10 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h4 className="text-xl font-bold text-[#1a1b22]">
                  My Learning Progress
                </h4>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Continue where you left off
                </p>
              </div>
            </div>
            {data.courseProgress?.length === 0 ? (
              <p className="text-sm text-zinc-400 text-center py-6">
                No courses assigned yet.
              </p>
            ) : (
              <div className="space-y-7">
                {data.courseProgress?.map(
                  ({ course, completed, total, pct }: any) => (
                    <div
                      key={course._id}
                      className="grid grid-cols-12 gap-4 items-center"
                    >
                      <div className="col-span-12 md:col-span-5 flex items-center gap-4">
                        <div className="w-16 h-12 rounded-lg bg-[#e8e7f1] flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[#3525cd] text-[24px]">
                            auto_stories
                          </span>
                        </div>
                        <div>
                          <Link
                            href={`/courses/${course._id}`}
                            className="text-sm font-bold text-[#1a1b22] hover:text-[#3525cd] transition-colors"
                          >
                            {course.title}
                          </Link>
                          <p className="text-[10px] text-zinc-400">
                            {completed} of {total} Lessons complete
                          </p>
                        </div>
                      </div>
                      <div className="col-span-12 md:col-span-5">
                        <div className="h-2 w-full bg-[#e3e1ec] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#4f46e5] rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                      <div className="col-span-12 md:col-span-2 text-right">
                        <span className="text-xs font-black text-[#1a1b22]">
                          {pct}%
                        </span>
                      </div>
                    </div>
                  ),
                )}
              </div>
            )}
          </div>

          {/* Pending assessments */}
          {data.pending?.length > 0 && (
            <div className="bg-[#f4f2fd] rounded-xl p-8 border border-white/50">
              <h4 className="text-xl font-bold text-[#1a1b22] mb-6">
                Pending Assessments
              </h4>
              <div className="grid md:grid-cols-2 gap-4">
                {data.pending.map((a: any) => (
                  <div
                    key={a._id}
                    className="bg-white p-5 rounded-xl flex flex-col justify-between hover:shadow-lg transition-shadow duration-300"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-2 py-0.5 bg-[#ffdad6] text-[#93000a] text-[10px] font-bold rounded">
                          PENDING
                        </span>
                      </div>
                      <h5 className="font-bold text-sm mb-1 text-[#1a1b22]">
                        {a.title}
                      </h5>
                    </div>
                    <Link
                      href={`/courses/${a.courseId}/assessment/${a._id}`}
                      className="flex items-center gap-1 text-[#3525cd] text-xs font-bold group mt-4"
                    >
                      Start Assessment
                      <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">
                        arrow_forward
                      </span>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
