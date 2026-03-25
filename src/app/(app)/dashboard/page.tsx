"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/useAuth";
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
  const [data, setData] = useState<any>(null);
  const [announcements, setAnnouncements] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    async function load() {
      const [coursesRes, notifRes] = await Promise.all([
        fetch("/api/courses"),
        fetch("/api/notifications"),
      ]);
      const courses = await coursesRes.json();
      const notifs = await notifRes.json();

      setAnnouncements(
        notifs.filter((n: any) => n.type === "announcement").slice(0, 5),
      );

      if (user!.role === "admin") {
        const [usersRes, gradesRes] = await Promise.all([
          fetch("/api/users"),
          fetch("/api/grades?courseId="),
        ]);
        const users = await usersRes.json();
        setData({
          activeUsers: users.filter((u: any) => u.isActive).length,
          publishedCourses: courses.filter((c: any) => c.status === "published")
            .length,
          totalCourses: courses.length,
        });
      } else if (user!.role === "instructor") {
        setData({ myCourses: courses, enrolledCount: 0 });
      } else {
        // student
        const progressRes = await Promise.all(
          courses.map((c: any) =>
            fetch(`/api/progress?courseId=${c._id}`).then((r) => r.json()),
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
        const assessmentsRes = await fetch(`/api/assessments`);
        const assessments = await assessmentsRes.json();
        const gradesRes = await fetch(`/api/grades?courseId=`);
        const grades = await gradesRes.json();
        const pending = assessments.filter(
          (a: any) =>
            !grades.find(
              (r: any) =>
                r.assessmentId?._id === a._id || r.assessmentId === a._id,
            ),
        );
        setData({ courseProgress, pending });
      }
    }

    load();
  }, [user]);

  if (!user || !data) return null;

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

      {user.role === "admin" && (
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
            label="Total Courses"
            value={data.totalCourses}
            icon={<ClipboardList className="w-4 h-4" />}
          />
        </div>
      )}

      {user.role === "instructor" && (
        <div className="grid grid-cols-2 gap-4">
          <StatCard
            label="My Courses"
            value={data.myCourses?.length || 0}
            icon={<BookOpen className="w-4 h-4" />}
          />
          <StatCard
            label="Enrolled Staff"
            value={data.enrolledCount || 0}
            icon={<Users className="w-4 h-4" />}
          />
        </div>
      )}

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
                  ({ course, completed, total, pct }: any) => (
                    <li key={course._id} className="px-4 py-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <Link
                          href={`/courses/${course._id}`}
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
                {data.pending.map((a: any) => (
                  <li
                    key={a._id}
                    className="px-4 py-3 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium text-zinc-900">
                        {a.title}
                      </p>
                    </div>
                    <Link
                      href={`/courses/${a.courseId}/assessment/${a._id}`}
                      className="text-xs text-indigo-600 hover:underline"
                    >
                      Start →
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

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
            {announcements.map((a: any) => (
              <li key={a._id} className="px-4 py-3">
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
