"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useNotifications } from "@/lib/useNotifications";
import { Loader2 } from "lucide-react";

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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
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
        <p className="text-sm text-red-300 bg-red-500/10 border border-red-400/30 rounded-xl px-3 py-2">
          {error}
        </p>
      )}

      {assessment.questions.map((q, idx) => (
        <div
          key={q._id}
          className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 space-y-3"
        >
          <p className="text-sm font-medium text-white">
            <span className="text-slate-500 mr-2">{idx + 1}.</span>
            {q.text}
          </p>

          {q.type === "mcq" && (
            <div className="space-y-2">
              {(q.options || []).filter(Boolean).map((opt) => (
                <label
                  key={opt}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                      answers[q._id] === opt
                        ? "border-indigo-400 bg-indigo-400"
                        : "border-white/20 group-hover:border-indigo-400/50"
                    }`}
                  >
                    {answers[q._id] === opt && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </div>
                  <input
                    type="radio"
                    name={`q-${q._id}`}
                    value={opt}
                    checked={answers[q._id] === opt}
                    onChange={() => setAnswers((p) => ({ ...p, [q._id]: opt }))}
                    className="sr-only"
                  />
                  <span
                    className={`text-sm transition-colors ${answers[q._id] === opt ? "text-white" : "text-slate-300 group-hover:text-white"}`}
                  >
                    {opt}
                  </span>
                </label>
              ))}
            </div>
          )}

          {q.type === "truefalse" && (
            <div className="flex gap-3">
              {["True", "False"].map((val) => (
                <label
                  key={val}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                      answers[q._id] === val
                        ? "border-indigo-400 bg-indigo-400"
                        : "border-white/20"
                    }`}
                  >
                    {answers[q._id] === val && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </div>
                  <input
                    type="radio"
                    name={`q-${q._id}`}
                    value={val}
                    checked={answers[q._id] === val}
                    onChange={() => setAnswers((p) => ({ ...p, [q._id]: val }))}
                    className="sr-only"
                  />
                  <span
                    className={`text-sm ${answers[q._id] === val ? "text-white" : "text-slate-300"}`}
                  >
                    {val}
                  </span>
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
              placeholder="Write your answer…"
              className="w-full px-3 py-2.5 text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 outline-none focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
            />
          )}
        </div>
      ))}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={submitting || !allAnswered}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-blue-600 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all hover:opacity-90"
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {submitting ? "Submitting…" : "Submit assessment"}
        </button>
      </div>
    </form>
  );
}
