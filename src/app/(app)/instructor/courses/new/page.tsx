"use client";

import { useAuth } from "@/lib/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import CourseForm from "@/components/instructor/CourseForm";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

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
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Breadcrumbs
          items={[
            { label: "My Courses", href: "/instructor/courses" },
            { label: "New Course" },
          ]}
        />
        <h1 className="text-xl font-semibold text-zinc-900">New Course</h1>
        <p className="text-sm text-zinc-500 mt-0.5">
          Fill in the details to create a course.
        </p>
      </div>
      <CourseForm />
    </div>
  );
}
