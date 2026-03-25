"use client";

import { useState } from "react";

type QType = "mcq" | "truefalse" | "short";
type Q = {
  _id: string;
  type: QType;
  text: string;
  options: string[];
  correctAnswer: string;
};

function emptyQ(): Q {
  return {
    _id: crypto.randomUUID(),
    type: "mcq",
    text: "",
    options: ["", "", "", ""],
    correctAnswer: "",
  };
}

type ExistingAssessment = {
  _id: string;
  title: string;
  passingScore: number;
  questions: Q[];
};

export default function AssessmentBuilder({
  courseId,
  moduleId,
  existing,
}: {
  courseId: string;
  moduleId: string;
  existing: ExistingAssessment | null;
}) {
  const [title, setTitle] = useState(existing?.title || "");
  const [passingScore, setPassingScore] = useState(
    existing?.passingScore || 70,
  );
  const [questions, setQuestions] = useState<Q[]>(
    existing?.questions.map((q) => ({
      _id: q._id?.toString() || crypto.randomUUID(),
      type: q.type,
      text: q.text,
      options: q.options || ["", "", "", ""],
      correctAnswer: q.correctAnswer || "",
    })) || [emptyQ()],
  );
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function updateQ(id: string, patch: Partial<Q>) {
    setQuestions((p) => p.map((q) => (q._id === id ? { ...q, ...patch } : q)));
  }

  async function save() {
    setLoading(true);
    setError("");

    const payload = { courseId, moduleId, title, passingScore, questions };
    const res = existing
      ? await fetch(`/api/assessments/${existing._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      : await fetch("/api/assessments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } else {
      setError("Failed to save assessment");
    }
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      {saved && (
        <p className="text-sm text-green-600 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
          Assessment saved.
        </p>
      )}
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
      <div className="bg-white border border-zinc-200 rounded-xl p-4 grid sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label
            htmlFor="assess-title"
            className="text-sm font-medium text-zinc-700"
          >
            Assessment title
          </label>
          <input
            id="assess-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Module 1 Quiz"
            className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="space-y-1">
          <label
            htmlFor="passing-score"
            className="text-sm font-medium text-zinc-700"
          >
            Passing score (%)
          </label>
          <input
            id="passing-score"
            type="number"
            min={0}
            max={100}
            value={passingScore}
            onChange={(e) => setPassingScore(Number(e.target.value))}
            className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="space-y-4">
        {questions.map((q, idx) => (
          <div
            key={q._id}
            className="bg-white border border-zinc-200 rounded-xl p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-500">
                Question {idx + 1}
              </span>
              <div className="flex items-center gap-3">
                <select
                  value={q.type}
                  onChange={(e) =>
                    updateQ(q._id, { type: e.target.value as QType })
                  }
                  aria-label={`Question ${idx + 1} type`}
                  className="text-xs border border-zinc-200 rounded-md px-2 py-1 outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="mcq">Multiple Choice</option>
                  <option value="truefalse">True / False</option>
                  <option value="short">Short Answer</option>
                </select>
                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      setQuestions((p) => p.filter((x) => x._id !== q._id))
                    }
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
            <div className="space-y-1">
              <label htmlFor={`qt-${q._id}`} className="text-xs text-zinc-500">
                Question text
              </label>
              <input
                id={`qt-${q._id}`}
                type="text"
                value={q.text}
                onChange={(e) => updateQ(q._id, { text: e.target.value })}
                placeholder="Enter your question..."
                className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            {q.type === "mcq" && (
              <div className="space-y-2">
                <p className="text-xs text-zinc-500">
                  Options (select correct answer)
                </p>
                {q.options.map((opt, oi) => (
                  <div key={oi} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`correct-${q._id}`}
                      checked={q.correctAnswer === opt}
                      onChange={() => updateQ(q._id, { correctAnswer: opt })}
                      aria-label={`Mark option ${oi + 1} as correct`}
                      className="accent-indigo-600"
                    />
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const opts = [...q.options];
                        opts[oi] = e.target.value;
                        updateQ(q._id, { options: opts });
                      }}
                      aria-label={`Option ${oi + 1}`}
                      placeholder={`Option ${oi + 1}`}
                      className="flex-1 px-3 py-1.5 text-sm border border-zinc-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                ))}
              </div>
            )}
            {q.type === "truefalse" && (
              <div className="flex gap-4">
                {["True", "False"].map((val) => (
                  <label
                    key={val}
                    className="flex items-center gap-2 text-sm text-zinc-700 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name={`tf-${q._id}`}
                      checked={q.correctAnswer === val}
                      onChange={() => updateQ(q._id, { correctAnswer: val })}
                      className="accent-indigo-600"
                    />
                    {val}
                  </label>
                ))}
              </div>
            )}
            {q.type === "short" && (
              <p className="text-xs text-zinc-400 italic">
                Short answer — manually graded.
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setQuestions((p) => [...p, emptyQ()])}
          className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
        >
          + Add question
        </button>
        <button
          type="button"
          onClick={save}
          disabled={!title.trim() || loading}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {loading ? "Saving..." : "Save assessment"}
        </button>
      </div>
    </div>
  );
}
