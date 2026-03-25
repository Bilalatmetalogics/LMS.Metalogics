"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AssessmentTaker from "@/components/learn/AssessmentTaker";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";

type Assessment = {
  _id: string;
  title: string;
  passingScore: number;
  questions: any[];
};

type Result = { score: number; passed: boolean };

export default function TakeAssessmentPage() {
  const params = useParams<{ id: string; assessmentId: string }>();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [courseTitle, setCourseTitle] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    const [aRes, cRes, gRes] = await Promise.all([
      fetch(`/api/assessments/${params.assessmentId}`),
      fetch(`/api/courses/${params.id}`),
      fetch(`/api/grades?courseId=${params.id}`),
    ]);
    const a = await aRes.json();
    const c = await cRes.json();
    const grades = await gRes.json();
    setAssessment(a);
    setCourseTitle(c.title || "");
    const existing = grades.find(
      (r: any) =>
        r.assessmentId?._id === params.assessmentId ||
        r.assessmentId === params.assessmentId,
    );
    if (existing) setResult({ score: existing.score, passed: existing.passed });
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [params.assessmentId]);

  if (loading || !assessment) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Breadcrumbs
          items={[
            { label: "Courses", href: "/courses" },
            { label: courseTitle, href: `/courses/${params.id}` },
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

      {result ? (
        <div className="bg-white border border-zinc-200 rounded-xl p-8 text-center space-y-4">
          {result.passed ? (
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
          ) : (
            <XCircle className="w-12 h-12 text-red-400 mx-auto" />
          )}
          <div>
            <p className="text-4xl font-bold text-zinc-900">{result.score}%</p>
            <Badge
              variant={result.passed ? "success" : "danger"}
              className="mt-2"
            >
              {result.passed ? "Passed" : "Not passed"}
            </Badge>
          </div>
          <p className="text-sm text-zinc-500">
            {result.passed
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
