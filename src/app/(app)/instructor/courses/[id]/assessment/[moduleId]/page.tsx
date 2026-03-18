"use client";

import { useAuth } from "@/lib/useAuth";
import { db } from "@/lib/mockStore";
import { useParams } from "next/navigation";
import AssessmentBuilder from "@/components/instructor/AssessmentBuilder";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

export default function AssessmentPage() {
  const { user } = useAuth();
  const params = useParams<{ id: string; moduleId: string }>();
  if (!user || !["admin", "instructor"].includes(user.role)) return null;

  const existing = db.assessments.findByModule(params.moduleId) || null;
  const course = db.courses.findById(params.id);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Breadcrumbs
          items={[
            { label: "My Courses", href: "/instructor/courses" },
            {
              label: course?.title ?? "Course",
              href: `/instructor/courses/${params.id}`,
            },
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
