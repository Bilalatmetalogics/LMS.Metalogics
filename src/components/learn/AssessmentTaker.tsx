"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useNotifications } from "@/lib/useNotifications";

type Question = {
  _id: string;
  type: "mcq" | "truefalse" | "short";
  text: string;
  options?: string[];
};

type Assessment = {
  _id: string;
  title: string;
  passingScore: number;
  questions: Question[];
};

export default function AssessmentTaker({
  assessment,
  courseId,
}: {
  assessment: Assessment;
  courseId: string;
}) {
  const router = useRouter();
  const { refresh } = useNotifications();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const allAnswered = assessment.questions.every((q) => answers[q._id]?.trim());

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!allAnswered) return;
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch(`/api/assessments/${assessment._id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          answers: Object.entries(answers).map(([questionId, answer]) => ({
            questionId,
            answer,
          })),
        }),
      });

      if (!res.ok) throw new Error("Submission failed");
      await refresh();
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
      {assessment.questions.map((q, idx) => (
        <div
          key={q._id}
          className="bg-white border border-zinc-200 rounded-xl p-4 space-y-3"
        >
          <p className="text-sm font-medium text-zinc-900">
            <span className="text-zinc-400 mr-2">{idx + 1}.</span>
            {q.text}
          </p>
          {q.type === "mcq" && (
            <div className="space-y-2">
              {(q.options || []).filter(Boolean).map((opt) => (
                <label
                  key={opt}
                  className="flex items-center gap-2.5 cursor-pointer group"
                >
                  <input
                    type="radio"
                    name={`q-${q._id}`}
                    value={opt}
                    checked={answers[q._id] === opt}
                    onChange={() => setAnswers((p) => ({ ...p, [q._id]: opt }))}
                    className="accent-indigo-600"
                  />
                  <span className="text-sm text-zinc-700 group-hover:text-zinc-900">
                    {opt}
                  </span>
                </label>
              ))}
            </div>
          )}
          {q.type === "truefalse" && (
            <div className="flex gap-6">
              {["True", "False"].map((val) => (
                <label
                  key={val}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="radio"
                    name={`q-${q._id}`}
                    value={val}
                    checked={answers[q._id] === val}
                    onChange={() => setAnswers((p) => ({ ...p, [q._id]: val }))}
                    className="accent-indigo-600"
                  />
                  <span className="text-sm text-zinc-700">{val}</span>
                </label>
              ))}
            </div>
          )}
          {q.type === "short" && (
            <textarea
              value={answers[q._id] || ""}
              onChange={(e) =>
                setAnswers((p) => ({ ...p, [q._id]: e.target.value }))
              }
              rows={3}
              aria-label={`Answer for question ${idx + 1}`}
              placeholder="Write your answer..."
              className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          )}
        </div>
      ))}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={submitting || !allAnswered}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {submitting ? "Submitting..." : "Submit assessment"}
        </button>
      </div>
    </form>
  );
}
