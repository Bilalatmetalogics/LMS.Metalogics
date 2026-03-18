"use client";

import { useState } from "react";
import { db, MockAssessment, MockResult } from "@/lib/mockStore";
import { useAuth } from "@/lib/useAuth";
import { useRouter } from "next/navigation";
import { useNotifications } from "@/lib/useNotifications";

export default function AssessmentTaker({
  assessment,
  courseId,
}: {
  assessment: MockAssessment;
  courseId: string;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const { refresh } = useNotifications();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const allAnswered = assessment.questions.every((q) => answers[q.id]?.trim());

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);

    const autoQs = assessment.questions.filter((q) => q.type !== "short");
    const correct = autoQs.filter(
      (q) => answers[q.id]?.toLowerCase() === q.correctAnswer?.toLowerCase(),
    ).length;
    const score =
      autoQs.length > 0 ? Math.round((correct / autoQs.length) * 100) : 0;
    const passed = score >= assessment.passingScore;

    const result: MockResult = {
      id: crypto.randomUUID(),
      userId: user.id,
      assessmentId: assessment.id,
      courseId,
      score,
      passed,
      gradedAt: new Date().toISOString(),
    };
    db.results.add(result);
    db.notifications.add({
      id: crypto.randomUUID(),
      userId: user.id,
      type: "grade",
      message: `Assessment graded: ${score}% — ${passed ? "Passed ✓" : "Not passed"}`,
      link: `/courses/${courseId}`,
      read: false,
      createdAt: new Date().toISOString(),
    });

    refresh(user.id);
    router.refresh();
    setSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {assessment.questions.map((q, idx) => (
        <div
          key={q.id}
          className="bg-white border border-zinc-200 rounded-xl p-4 space-y-3"
        >
          <p className="text-sm font-medium text-zinc-900">
            <span className="text-zinc-400 mr-2">{idx + 1}.</span>
            {q.text}
          </p>
          {q.type === "mcq" && (
            <div className="space-y-2">
              {q.options.filter(Boolean).map((opt) => (
                <label
                  key={opt}
                  className="flex items-center gap-2.5 cursor-pointer group"
                >
                  <input
                    type="radio"
                    name={`q-${q.id}`}
                    value={opt}
                    checked={answers[q.id] === opt}
                    onChange={() => setAnswers((p) => ({ ...p, [q.id]: opt }))}
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
                    name={`q-${q.id}`}
                    value={val}
                    checked={answers[q.id] === val}
                    onChange={() => setAnswers((p) => ({ ...p, [q.id]: val }))}
                    className="accent-indigo-600"
                  />
                  <span className="text-sm text-zinc-700">{val}</span>
                </label>
              ))}
            </div>
          )}
          {q.type === "short" && (
            <textarea
              value={answers[q.id] || ""}
              onChange={(e) =>
                setAnswers((p) => ({ ...p, [q.id]: e.target.value }))
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
