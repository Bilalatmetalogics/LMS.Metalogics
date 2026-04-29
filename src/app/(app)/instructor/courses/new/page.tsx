"use client";

import { useAuth } from "@/lib/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import CourseForm from "@/components/instructor/CourseForm";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function NewCoursePage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !["admin", "instructor"].includes(user.role)) {
      router.replace("/dashboard");
    }
  }, [user, router]);

  if (!user || !["admin", "instructor"].includes(user.role)) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6 text-white">
      <div>
        <nav className="flex items-center gap-1.5 text-xs text-slate-400 mb-2">
          <Link
            href="/instructor/courses"
            className="hover:text-white transition-colors"
          >
            My Courses
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-white">New Course</span>
        </nav>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          New Course
        </h1>
        <p className="text-sm text-slate-400 mt-0.5">
          Fill in the details to create a course.
        </p>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
        <CourseForm />
      </div>
    </div>
  );
}
