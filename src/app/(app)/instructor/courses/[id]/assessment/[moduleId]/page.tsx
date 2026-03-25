"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/useAuth";
import { useParams } from "next/navigation";
import AssessmentBuilder from "@/components/instructor/AssessmentBuilder";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

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
  if (loading) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Breadcrumbs
          items={[
            { label: "My Courses", href: "/instructor/courses" },
            { label: courseTitle, href: `/instructor/courses/${params.id}` },
            { label: "Assessment" },
          ]}
        />
        <h1 className="text-xl font-semibold text-zinc-900">
          Module Assessment
        </h1>
      </div>
      <AssessmentBuilder
        courseId={params.id}
        moduleId={params.moduleId}
        existing={existing}
      />
    </div>
  );
}
