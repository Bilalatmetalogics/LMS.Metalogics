"use client";

import { useAuth } from "@/lib/useAuth";
import { db } from "@/lib/mockStore";
import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { ClipboardList } from "lucide-react";

export default function GradesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId") || "";
  if (!user || !["admin", "instructor"].includes(user.role)) return null;

  const courses = useMemo(() => {
    const all = db.courses.getAll();
    return user.role === "admin"
      ? all
      : all.filter((c) => c.createdBy === user.id);
  }, [user]);

  const results = useMemo(() => {
    if (!courseId) return [];
    return db.results.forCourse(courseId).map((r) => ({
      ...r,
      user: db.users.findById(r.userId),
      assessment: db.assessments.findById(r.assessmentId),
    }));
  }, [courseId]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="text-xl font-semibold text-zinc-900">Grade Book</h1>

      <div className="flex items-center gap-3">
        <label
          htmlFor="course-select"
          className="text-sm font-medium text-zinc-700 shrink-0"
        >
          Course
        </label>
        <select
          id="course-select"
          value={courseId}
          onChange={(e) =>
            router.push(`/instructor/grades?courseId=${e.target.value}`)
          }
          className="px-3 py-2 text-sm border border-zinc-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Select a course...</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </div>

      {courseId && (
        <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
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
                  Submitted
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {results.map((r) => (
                <tr key={r.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-zinc-900">{r.user?.name}</p>
                    <p className="text-xs text-zinc-400">{r.user?.email}</p>
                  </td>
                  <td className="px-4 py-3 text-zinc-600">
                    {r.assessment?.title}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-zinc-900">
                      {r.score}%
                    </span>
                    <span className="text-xs text-zinc-400 ml-1">
                      / {r.assessment?.passingScore}% pass
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={r.passed ? "success" : "danger"}>
                      {r.passed ? "Passed" : "Failed"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-400">
                    {new Date(r.gradedAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {results.length === 0 && (
            <div className="py-12 text-center">
              <ClipboardList className="w-8 h-8 text-zinc-200 mx-auto mb-2" />
              <p className="text-sm text-zinc-400">No submissions yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
