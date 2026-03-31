"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/useAuth";
import { useParams } from "next/navigation";
import CourseForm from "@/components/instructor/CourseForm";
import ModuleBuilder from "@/components/instructor/ModuleBuilder";
import AssignUsers from "@/components/instructor/AssignUsers";
import AnnouncementForm from "@/components/instructor/AnnouncementForm";
import Link from "next/link";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

export default function CourseEditorPage() {
  const { user } = useAuth();
  const params = useParams<{ id: string }>();
  const [course, setCourse] = useState<any>(null);
  const [assigned, setAssigned] = useState<any[]>([]);
  const [unassigned, setUnassigned] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/courses/${params.id}`).then((r) => r.json()),
      fetch(`/api/courses/${params.id}/assign`).then((r) => r.json()),
    ])
      .then(([c, users]) => {
        setCourse({ ...c, modules: c.modules ?? [] });
        setAssigned(users.assigned || []);
        setUnassigned(users.unassigned || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  if (!user || !["admin", "instructor"].includes(user.role)) return null;
  if (loading || !course) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <Breadcrumbs
            items={[
              { label: "My Courses", href: "/instructor/courses" },
              { label: course.title },
            ]}
          />
          <h1 className="text-xl font-semibold text-zinc-900">Edit Course</h1>
        </div>
        <Link
          href={`/instructor/grades?courseId=${params.id}`}
          className="text-sm text-indigo-600 hover:underline"
        >
          View grade book →
        </Link>
      </div>

      <section>
        <h2 className="text-sm font-semibold text-zinc-700 mb-3">
          Course Details
        </h2>
        <CourseForm course={course} />
      </section>

      <section>
        <h2 className="text-sm font-semibold text-zinc-700 mb-3">
          Modules & Videos
        </h2>
        <ModuleBuilder course={course} />
      </section>

      <section>
        <h2 className="text-sm font-semibold text-zinc-700 mb-3">
          Assign Staff
        </h2>
        <AssignUsers
          courseId={params.id}
          assigned={assigned}
          unassigned={unassigned}
        />
      </section>

      <section>
        <h2 className="text-sm font-semibold text-zinc-700 mb-3">
          Post Announcement
        </h2>
        <AnnouncementForm courseId={params.id} />
      </section>
    </div>
  );
}
