"use client";

import { useAuth } from "@/lib/useAuth";
import { db } from "@/lib/mockStore";
import { useParams } from "next/navigation";
import AssessmentTaker from "@/components/learn/AssessmentTaker";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";

export default function TakeAssessmentPage() {
  const { user } = useAuth();
  const params = useParams<{ id: string; assessmentId: string }>();
  if (!user) return null;

  const assessment = db.assessments.findById(params.assessmentId);
  const course = db.courses.findById(params.id);
  const existing = db.results.findByUser(user.id, params.assessmentId);

  if (!assessment)
    return (
      <div className="text-sm text-zinc-400 p-6">Assessment not found.</div>
    );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Breadcrumbs
          items={[
            { label: "Courses", href: "/courses" },
            { label: course?.title ?? "Course", href: `/courses/${params.id}` },
            { label: assessment.title },
          ]}
        />
        <h1 className="text-xl font-semibold text-zinc-900">
          {assessment.title}
        </h1>
        <p className="text-sm text-zinc-500 mt-0.5">
          Passing score: {assessment.passingScore}%
        </p>
      </div>

      {existing ? (
        <div className="bg-white border border-zinc-200 rounded-xl p-8 text-center space-y-4">
          {existing.passed ? (
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
          ) : (
            <XCircle className="w-12 h-12 text-red-400 mx-auto" />
          )}
          <div>
            <p className="text-4xl font-bold text-zinc-900">
              {existing.score}%
            </p>
            <Badge
              variant={existing.passed ? "success" : "danger"}
              className="mt-2"
            >
              {existing.passed ? "Passed" : "Not passed"}
            </Badge>
          </div>
          <p className="text-sm text-zinc-500">
            {existing.passed
              ? "Great work — you cleared the passing threshold."
              : `You needed ${assessment.passingScore}% to pass. Keep reviewing and try again.`}
          </p>
          <Link
            href={`/courses/${params.id}`}
            className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:underline"
          >
            ← Back to course
          </Link>
        </div>
      ) : (
        <AssessmentTaker assessment={assessment} courseId={params.id} />
      )}
    </div>
  );
}
