"use client";

import { useAuth } from "@/lib/useAuth";
import { db } from "@/lib/mockStore";
import { useMemo } from "react";
import Link from "next/link";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users, ClipboardList, TrendingUp } from "lucide-react";

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-4 flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-xs text-zinc-500">{label}</p>
        <p className="text-2xl font-semibold text-zinc-900 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  if (!user) return null;

  const data = useMemo(() => {
    const allCourses = db.courses.getAll();
    const allUsers = db.users.getAll();
    const allResults = db.results.getAll();

    if (user.role === "admin") {
      const activeUsers = allUsers.filter((u) => u.isActive).length;
      const publishedCourses = allCourses.filter(
        (c) => c.status === "published",
      ).length;
      const totalSubmissions = allResults.length;
      return { activeUsers, publishedCourses, totalSubmissions };
    }

    if (user.role === "instructor") {
      const myCourses = allCourses.filter((c) => c.createdBy === user.id);
      const enrolledCount = allUsers.filter((u) =>
        myCourses.some((c) => u.assignedCourses.includes(c.id)),
      ).length;
      const recentSubmissions = allResults
        .filter((r) => myCourses.some((c) => c.id === r.courseId))
        .sort((a, b) => b.gradedAt.localeCompare(a.gradedAt))
        .slice(0, 5);
      return { myCourses, enrolledCount, recentSubmissions };
    }

    // student
    const assignedCourses = allCourses.filter((c) =>
      user.assignedCourses.includes(c.id),
    );
    const courseProgress = assignedCourses.map((course) => {
      const allVideos = course.modules.flatMap((m) => m.videos);
      const completed = db.progress
        .forCourse(user.id, course.id)
        .filter((p) => p.completed).length;
      return {
        course,
        completed,
        total: allVideos.length,
        pct: allVideos.length
          ? Math.round((completed / allVideos.length) * 100)
          : 0,
      };
    });
    const assessments = db.assessments
      .getAll()
      .filter((a) => user.assignedCourses.includes(a.courseId));
    const pending = assessments.filter(
      (a) => !db.results.findByUser(user.id, a.id),
    );
    return { courseProgress, pending };
  }, [user]);

  const announcements = useMemo(
    () =>
      db.notifications
        .forUser(user.id)
        .filter((n) => n.type === "announcement")
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 5),
    [user.id],
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900">
          Welcome back, {user.name.split(" ")[0]}
        </h1>
        <p className="text-sm text-zinc-500 mt-0.5">
          Here&apos;s what&apos;s happening today.
        </p>
      </div>

      {/* Admin stats */}
      {user.role === "admin" && "activeUsers" in data && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <StatCard
            label="Active Users"
            value={data.activeUsers}
            icon={<Users className="w-4 h-4" />}
          />
          <StatCard
            label="Published Courses"
            value={data.publishedCourses}
            icon={<BookOpen className="w-4 h-4" />}
          />
          <StatCard
            label="Total Submissions"
            value={data.totalSubmissions}
            icon={<ClipboardList className="w-4 h-4" />}
          />
        </div>
      )}

      {/* Instructor stats */}
      {user.role === "instructor" && "myCourses" in data && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <StatCard
              label="My Courses"
              value={data.myCourses.length}
              icon={<BookOpen className="w-4 h-4" />}
            />
            <StatCard
              label="Enrolled Staff"
              value={data.enrolledCount}
              icon={<Users className="w-4 h-4" />}
            />
          </div>
          {data.recentSubmissions.length > 0 && (
            <div className="bg-white border border-zinc-200 rounded-xl">
              <div className="px-4 py-3 border-b border-zinc-100">
                <h2 className="text-sm font-semibold text-zinc-900">
                  Recent Submissions
                </h2>
              </div>
              <ul className="divide-y divide-zinc-100">
                {data.recentSubmissions.map((r) => {
                  const u = db.users.findById(r.userId);
                  const a = db.assessments.findById(r.assessmentId);
                  return (
                    <li
                      key={r.id}
                      className="px-4 py-3 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-sm font-medium text-zinc-900">
                          {u?.name ?? "Unknown"}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {a?.title ?? "Assessment"}
                        </p>
                      </div>
                      <Badge variant={r.passed ? "success" : "danger"}>
                        {r.score}%
                      </Badge>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </>
      )}

      {/* Student stats */}
      {user.role === "student" && "courseProgress" in data && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <StatCard
              label="Assigned Courses"
              value={data.courseProgress.length}
              icon={<BookOpen className="w-4 h-4" />}
            />
            <StatCard
              label="Pending Assessments"
              value={data.pending.length}
              icon={<ClipboardList className="w-4 h-4" />}
            />
          </div>

          {data.courseProgress.length > 0 && (
            <div className="bg-white border border-zinc-200 rounded-xl">
              <div className="px-4 py-3 border-b border-zinc-100 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-zinc-400" />
                <h2 className="text-sm font-semibold text-zinc-900">
                  My Progress
                </h2>
              </div>
              <ul className="divide-y divide-zinc-100">
                {data.courseProgress.map(
                  ({ course, completed, total, pct }) => (
                    <li key={course.id} className="px-4 py-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <Link
                          href={`/courses/${course.id}`}
                          className="text-sm font-medium text-zinc-900 hover:text-indigo-700 transition-colors"
                        >
                          {course.title}
                        </Link>
                        <span className="text-xs text-zinc-500">
                          {completed}/{total} videos
                        </span>
                      </div>
                      <ProgressBar value={pct} showLabel />
                    </li>
                  ),
                )}
              </ul>
            </div>
          )}

          {data.pending.length > 0 && (
            <div className="bg-white border border-zinc-200 rounded-xl">
              <div className="px-4 py-3 border-b border-zinc-100">
                <h2 className="text-sm font-semibold text-zinc-900">
                  Pending Assessments
                </h2>
              </div>
              <ul className="divide-y divide-zinc-100">
                {data.pending.map((a) => {
                  const course = db.courses.findById(a.courseId);
                  return (
                    <li
                      key={a.id}
                      className="px-4 py-3 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-sm font-medium text-zinc-900">
                          {a.title}
                        </p>
                        <p className="text-xs text-zinc-500">{course?.title}</p>
                      </div>
                      <Link
                        href={`/courses/${a.courseId}/assessment/${a.id}`}
                        className="text-xs text-indigo-600 hover:underline"
                      >
                        Start →
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </>
      )}

      {/* Announcements */}
      <div className="bg-white border border-zinc-200 rounded-xl">
        <div className="px-4 py-3 border-b border-zinc-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-900">
            Recent Announcements
          </h2>
          <Link
            href="/notifications"
            className="text-xs text-indigo-600 hover:underline"
          >
            View all
          </Link>
        </div>
        {announcements.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-zinc-400">
            No announcements yet.
          </div>
        ) : (
          <ul className="divide-y divide-zinc-100">
            {announcements.map((a) => (
              <li key={a.id} className="px-4 py-3">
                <p className="text-sm text-zinc-900">{a.message}</p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {new Date(a.createdAt).toLocaleDateString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
