"use client";

import { useRouter } from "next/navigation";

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

export default function GradeBook({
  courses,
  results,
  selectedCourseId,
}: {
  courses: Course[];
  results: Result[];
  selectedCourseId?: string;
}) {
  const router = useRouter();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <label
          htmlFor="course-select"
          className="text-sm font-medium text-zinc-700 shrink-0"
        >
          Course
        </label>
        <select
          id="course-select"
          value={selectedCourseId || ""}
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

      {selectedCourseId && (
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
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full ${r.passed ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}
                      >
                        {r.passed ? "Passed" : "Failed"}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-amber-50 text-amber-600">
                        Pending review
                      </span>
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
            <div className="py-12 text-center text-sm text-zinc-400">
              No submissions yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
