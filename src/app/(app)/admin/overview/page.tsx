"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/useAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BookOpen, Users, ClipboardList, TrendingUp } from "lucide-react";

type Course = {
  _id: string;
  title: string;
  category: string;
  status: string;
  createdBy?: { name: string };
  modules: { videos: any[] }[];
};

type AssignedUsers = { assigned: { _id: string }[] };

type GradeResult = {
  _id: string;
  userId: { name: string; email: string };
  assessmentId: { title: string };
  score: number;
  passed: boolean;
  createdAt: string;
};

export default function AdminOverviewPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Record<string, number>>({});
  const [recentGrades, setRecentGrades] = useState<GradeResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.role !== "admin") {
      router.replace("/dashboard");
      return;
    }
  }, [user, router]);

  useEffect(() => {
    if (!user || user.role !== "admin") return;

    async function load() {
      const coursesRes = await fetch("/api/courses");
      const allCourses: Course[] = coursesRes.ok ? await coursesRes.json() : [];
      setCourses(allCourses);

      // Fetch enrollment counts for each course in parallel
      const enrollmentData = await Promise.all(
        allCourses.map(async (c) => {
          try {
            const r = await fetch(`/api/courses/${c._id}/assign`);
            const data: AssignedUsers = r.ok
              ? await r.json()
              : { assigned: [] };
            return { id: c._id, count: data.assigned?.length || 0 };
          } catch {
            return { id: c._id, count: 0 };
          }
        }),
      );
      const enrollMap: Record<string, number> = {};
      enrollmentData.forEach(({ id, count }) => {
        enrollMap[id] = count;
      });
      setEnrollments(enrollMap);

      // Fetch recent grades across all courses (no courseId filter = all)
      const gradesRes = await fetch("/api/grades");
      const grades: GradeResult[] = gradesRes.ok ? await gradesRes.json() : [];
      setRecentGrades(grades.slice(0, 10));

      setLoading(false);
    }

    load();
  }, [user]);

  if (!user || user.role !== "admin" || loading) return null;

  const totalContent = courses.reduce(
    (sum, c) =>
      sum + c.modules.reduce((s, m) => s + (m.videos?.length || 0), 0),
    0,
  );
  const totalEnrolled = Object.values(enrollments).reduce((a, b) => a + b, 0);
  const published = courses.filter((c) => c.status === "published").length;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">
            System Overview
          </h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            All courses, enrollments, and activity
          </p>
        </div>
        <Link
          href="/instructor/courses/new"
          className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          New course
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: "Total Courses",
            value: courses.length,
            icon: <BookOpen className="w-4 h-4" />,
          },
          {
            label: "Published",
            value: published,
            icon: <TrendingUp className="w-4 h-4" />,
          },
          {
            label: "Total Enrollments",
            value: totalEnrolled,
            icon: <Users className="w-4 h-4" />,
          },
          {
            label: "Content Items",
            value: totalContent,
            icon: <ClipboardList className="w-4 h-4" />,
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white border border-zinc-200 rounded-xl p-4 flex items-start gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
              {s.icon}
            </div>
            <div>
              <p className="text-xs text-zinc-500">{s.label}</p>
              <p className="text-2xl font-semibold text-zinc-900 mt-0.5">
                {s.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Courses table */}
      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-900">All Courses</h2>
          <Link
            href="/courses"
            className="text-xs text-indigo-600 hover:underline"
          >
            View all →
          </Link>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50">
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">
                Course
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">
                Instructor
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">
                Status
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">
                Enrolled
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">
                Content
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {courses.map((c) => {
              const contentCount = c.modules.reduce(
                (s, m) => s + (m.videos?.length || 0),
                0,
              );
              return (
                <tr key={c._id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-zinc-900">{c.title}</p>
                    <p className="text-xs text-zinc-400">{c.category}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-500">
                    {(c.createdBy as any)?.name || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full ${c.status === "published" ? "bg-green-50 text-green-700" : "bg-zinc-100 text-zinc-500"}`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-700">
                    {enrollments[c._id] ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-700">
                    {contentCount} item{contentCount !== 1 ? "s" : ""}
                  </td>
                  <td className="px-4 py-3 flex items-center gap-3">
                    <Link
                      href={`/courses/${c._id}`}
                      className="text-xs text-zinc-500 hover:text-zinc-900"
                    >
                      View
                    </Link>
                    <Link
                      href={`/instructor/courses/${c._id}`}
                      className="text-xs text-indigo-600 hover:underline"
                    >
                      Edit
                    </Link>
                    <Link
                      href={`/instructor/grades?courseId=${c._id}`}
                      className="text-xs text-zinc-500 hover:text-zinc-900"
                    >
                      Grades
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {courses.length === 0 && (
          <div className="py-12 text-center text-sm text-zinc-400">
            No courses yet.
          </div>
        )}
      </div>

      {/* Recent submissions */}
      {recentGrades.length > 0 && (
        <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-100">
            <h2 className="text-sm font-semibold text-zinc-900">
              Recent Assessment Submissions
            </h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50">
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">
                  Staff
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">
                  Assessment
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">
                  Score
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">
                  Result
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {recentGrades.map((r) => (
                <tr key={r._id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-zinc-900">
                      {r.userId?.name}
                    </p>
                    <p className="text-xs text-zinc-400">{r.userId?.email}</p>
                  </td>
                  <td className="px-4 py-3 text-zinc-600">
                    {r.assessmentId?.title}
                  </td>
                  <td className="px-4 py-3 font-semibold text-zinc-900">
                    {r.score}%
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full ${r.passed ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}
                    >
                      {r.passed ? "Passed" : "Failed"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-400">
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
