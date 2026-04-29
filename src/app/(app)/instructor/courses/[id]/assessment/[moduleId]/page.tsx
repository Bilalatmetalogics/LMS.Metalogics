"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/useAuth";
import { useParams } from "next/navigation";
import AssessmentBuilder from "@/components/instructor/AssessmentBuilder";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function AssessmentPage() {
  const { user } = useAuth();
  const params = useParams<{ id: string; moduleId: string }>();
  const [existing, setExisting] = useState<any>(null);
  const [courseTitle, setCourseTitle] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/courses/${params.id}`).then((r) => r.json()),
      fetch(`/api/assessments?courseId=${params.id}`).then((r) => r.json()),
    ])
      .then(([course, assessments]) => {
        setCourseTitle(course.title || "");
        const found = assessments.find(
          (a: any) =>
            a.moduleId === params.moduleId ||
            a.moduleId?.toString() === params.moduleId,
        );
        setExisting(found || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id, params.moduleId]);

  if (!user || !["admin", "instructor"].includes(user.role)) return null;

  if (loading)
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto space-y-6 text-white">
      <div>
        <nav className="flex items-center gap-1.5 text-xs text-slate-400 mb-2">
          <Link
            href="/instructor/courses"
            className="hover:text-white transition-colors"
          >
            My Courses
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link
            href={`/instructor/courses/${params.id}`}
            className="hover:text-white transition-colors"
          >
            {courseTitle}
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-white">Assessment</span>
        </nav>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Module Assessment
        </h1>
        <p className="text-sm text-slate-400 mt-0.5">
          {existing
            ? "Edit the existing assessment for this module"
            : "Create a new assessment for this module"}
        </p>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
        <AssessmentBuilder
          courseId={params.id}
          moduleId={params.moduleId}
          existing={existing}
        />
      </div>
    </div>
  );
}
