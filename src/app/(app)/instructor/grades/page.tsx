"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/useAuth";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { ClipboardList } from "lucide-react";

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

export default function GradesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId") || "";
  const [courses, setCourses] = useState<Course[]>([]);
  const [results, setResults] = useState<Result[]>([]);

  useEffect(() => {
    fetch("/api/courses")
      .then((r) => r.json())
      .then(setCourses);
  }, []);

  useEffect(() => {
    if (!courseId) return;
    fetch(`/api/grades?courseId=${courseId}`)
      .then((r) => r.json())
      .then(setResults);
  }, [courseId]);

  if (!user || !["admin", "instructor"].includes(user.role)) return null;

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
            <option key={c._id} value={c._id}>
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
                  <td className="px-4 py-3">
                    <span className="font-semibold text-zinc-900">
                      {r.score}%
                    </span>
                    <span className="text-xs text-zinc-400 ml-1">
                      / {r.assessmentId?.passingScore}% pass
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {r.gradedAt ? (
                      <Badge variant={r.passed ? "success" : "danger"}>
                        {r.passed ? "Passed" : "Failed"}
                      </Badge>
                    ) : (
                      <Badge variant="warning">Pending review</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-400">
                    {new Date(r.createdAt).toLocaleDateString()}
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
