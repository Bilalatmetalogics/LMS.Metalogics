"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AssessmentTaker from "@/components/learn/AssessmentTaker";
import { CheckCircle2, XCircle, Clock, ChevronRight } from "lucide-react";
import Link from "next/link";

type Assessment = {
  _id: string;
  title: string;
  passingScore: number;
  questions: any[];
};
type Result = { score: number; passed: boolean; gradedAt?: string };

export default function TakeAssessmentPage() {
  const params = useParams<{ id: string; assessmentId: string }>();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [courseTitle, setCourseTitle] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    const [aRes, cRes, gradesRes] = await Promise.all([
      fetch(`/api/assessments/${params.assessmentId}`),
      fetch(`/api/courses/${params.id}`),
      fetch(`/api/grades?courseId=${params.id}`),
    ]);
    const a = aRes.ok ? await aRes.json() : null;
    const c = cRes.ok ? await cRes.json() : {};
    const grades = gradesRes.ok ? await gradesRes.json() : [];

    setAssessment(a);
    setCourseTitle(c.title || "");

    const existing = grades.find(
      (r: any) =>
        r.assessmentId?._id === params.assessmentId ||
        r.assessmentId === params.assessmentId,
    );
    if (existing)
      setResult({
        score: existing.score,
        passed: existing.passed,
        gradedAt: existing.gradedAt,
      });
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [params.assessmentId]);

  if (loading || !assessment)
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto space-y-6 text-white">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-400">
        <Link href="/courses" className="hover:text-white transition-colors">
          Courses
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link
          href={`/courses/${params.id}`}
          className="hover:text-white transition-colors"
        >
          {courseTitle}
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-white">{assessment.title}</span>
      </nav>

      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          {assessment.title}
        </h1>
        <p className="text-sm text-slate-400 mt-0.5">
          Passing score: {assessment.passingScore}%
        </p>
      </div>

      {result ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-10 text-center space-y-5">
          {result.passed ? (
            <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto" />
          ) : (
            <XCircle className="w-14 h-14 text-red-400 mx-auto" />
          )}
          <div>
            <p className="text-5xl font-bold text-white">{result.score}%</p>
            <span
              className={`inline-block mt-3 px-3 py-1 text-xs font-semibold rounded-full border ${
                result.passed
                  ? "bg-emerald-500/15 text-emerald-300 border-emerald-400/30"
                  : "bg-red-500/15 text-red-300 border-red-400/30"
              }`}
            >
              {result.passed ? "Passed" : "Not passed"}
            </span>
          </div>

          {!result.gradedAt && (
            <div className="flex items-center justify-center gap-2 text-sm text-amber-300 bg-amber-500/10 border border-amber-400/30 rounded-xl px-4 py-3">
              <Clock className="h-4 w-4 shrink-0" />
              Your short-answer responses are pending instructor review.
            </div>
          )}

          <p className="text-sm text-slate-400">
            {result.passed
              ? "Great work — you cleared the passing threshold."
              : `You needed ${assessment.passingScore}% to pass.`}
          </p>

          <Link
            href={`/courses/${params.id}`}
            className="inline-flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
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
