"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/useAuth";
import Link from "next/link";

type Course = {
  _id: string;
  title: string;
  category: string;
  modules: any[];
  status: string;
};

export default function InstructorCoursesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/courses")
      .then((r) => r.json())
      .then((data) => {
        setCourses(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (!user || !["admin", "instructor"].includes(user.role)) return null;
  if (loading) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">My Courses</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            {courses.length} course{courses.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/instructor/courses/new"
          className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          New course
        </Link>
      </div>

      {courses.length === 0 ? (
        <div className="bg-white border border-zinc-200 rounded-xl py-16 text-center">
          <p className="text-sm text-zinc-400">
            No courses yet. Create your first one.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50">
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">
                  Title
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">
                  Category
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">
                  Modules
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {courses.map((c) => (
                <tr key={c._id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-zinc-900">
                    {c.title}
                  </td>
                  <td className="px-4 py-3 text-zinc-500">{c.category}</td>
                  <td className="px-4 py-3 text-zinc-500">
                    {c.modules?.length || 0}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full ${c.status === "published" ? "bg-green-50 text-green-700" : "bg-zinc-100 text-zinc-500"}`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/instructor/courses/${c._id}`}
                      className="text-xs text-indigo-600 hover:underline"
                    >
                      Edit
                    </Link>
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
