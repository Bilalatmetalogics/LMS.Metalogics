"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/lib/useAuth";
import { useNotifications } from "@/lib/useNotifications";
import Link from "next/link";
import { BookOpen } from "lucide-react";

type Course = {
  _id: string;
  title: string;
  description: string;
  category: string;
  status: "draft" | "published";
  createdBy?: { name: string };
};

export default function CoursesPage() {
  const { user } = useAuth();
  const { subscribe } = useNotifications();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCourses = useCallback(() => {
    fetch("/api/courses")
      .then((r) => r.json())
      .then((data) => {
        setCourses(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Re-fetch when student gets assigned to a new course in real-time
  useEffect(() => {
    if (user?.role !== "student") return;
    const unsub = subscribe((payload) => {
      if (payload.type === "assignment") fetchCourses();
    });
    return unsub;
  }, [user?.role, subscribe, fetchCourses]);

  if (!user || loading) return null;

  const isStaff = ["admin", "instructor"].includes(user.role);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">
            {user.role === "student" ? "My Courses" : "Courses"}
          </h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            {courses.length} course{courses.length !== 1 ? "s" : ""}
          </p>
        </div>
        {isStaff && (
          <Link
            href="/instructor/courses/new"
            className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            New course
          </Link>
        )}
      </div>

      {courses.length === 0 ? (
        <div className="bg-white border border-zinc-200 rounded-xl py-16 text-center">
          <BookOpen className="w-8 h-8 text-zinc-200 mx-auto mb-3" />
          <p className="text-sm text-zinc-400">
            {user.role === "student"
              ? "No courses assigned yet."
              : "No courses yet."}
          </p>
        </div>
      ) : isStaff ? (
        // Staff: table view with edit links
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
                {user.role === "admin" && (
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">
                    Created by
                  </th>
                )}
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
                  {user.role === "admin" && (
                    <td className="px-4 py-3 text-zinc-500 text-xs">
                      {(c.createdBy as any)?.name || "—"}
                    </td>
                  )}
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full ${c.status === "published" ? "bg-green-50 text-green-700" : "bg-zinc-100 text-zinc-500"}`}
                    >
                      {c.status}
                    </span>
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        // Student: card grid
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((c) => (
            <Link
              key={c._id}
              href={`/courses/${c._id}`}
              className="bg-white border border-zinc-200 rounded-xl p-4 hover:border-indigo-300 hover:shadow-sm transition group"
            >
              <div className="w-full h-32 bg-zinc-100 rounded-lg mb-3 flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-zinc-300" />
              </div>
              <p className="text-sm font-semibold text-zinc-900 group-hover:text-indigo-700 transition-colors">
                {c.title}
              </p>
              <p className="text-xs text-zinc-500 mt-1 line-clamp-2">
                {c.description}
              </p>
              <div className="flex items-center gap-2 mt-3">
                <span className="text-xs px-2 py-0.5 bg-zinc-100 text-zinc-600 rounded-full">
                  {c.category}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
