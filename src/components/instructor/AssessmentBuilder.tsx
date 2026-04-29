"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Plus, Trash2 } from "lucide-react";

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

const inputCls =
  "w-full px-3 py-2.5 text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 outline-none focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-500/20 transition-all";

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
    } else setError("Failed to save assessment");
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      {saved && (
        <div className="flex items-center gap-2 text-sm text-emerald-300 bg-emerald-500/10 border border-emerald-400/30 rounded-xl px-3 py-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" /> Assessment saved.
        </div>
      )}
      {error && (
        <p className="text-sm text-red-300 bg-red-500/10 border border-red-400/30 rounded-xl px-3 py-2">
          {error}
        </p>
      )}

      {/* Header fields */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label
            htmlFor="assess-title"
            className="text-xs font-medium text-slate-300"
          >
            Assessment title
          </label>
          <input
            id="assess-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Module 1 Quiz"
            className={inputCls}
          />
        </div>
        <div className="space-y-1.5">
          <label
            htmlFor="passing-score"
            className="text-xs font-medium text-slate-300"
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
            className={inputCls}
          />
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-4">
        {questions.map((q, idx) => (
          <div
            key={q._id}
            className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 space-y-4"
          >
            {/* Question header */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Question {idx + 1}
              </span>
              <div className="flex items-center gap-3">
                <select
                  value={q.type}
                  onChange={(e) =>
                    updateQ(q._id, { type: e.target.value as QType })
                  }
                  aria-label={`Question ${idx + 1} type`}
                  className="text-xs bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-white outline-none focus:border-indigo-400/50 transition-all"
                >
                  <option value="mcq" className="bg-slate-900">
                    Multiple Choice
                  </option>
                  <option value="truefalse" className="bg-slate-900">
                    True / False
                  </option>
                  <option value="short" className="bg-slate-900">
                    Short Answer
                  </option>
                </select>
                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      setQuestions((p) => p.filter((x) => x._id !== q._id))
                    }
                    className="text-red-400 hover:text-red-300 transition-colors"
                    aria-label="Remove question"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Question text */}
            <div className="space-y-1.5">
              <label htmlFor={`qt-${q._id}`} className="text-xs text-slate-400">
                Question text
              </label>
              <input
                id={`qt-${q._id}`}
                type="text"
                value={q.text}
                onChange={(e) => updateQ(q._id, { text: e.target.value })}
                placeholder="Enter your question…"
                className={inputCls}
              />
            </div>

            {/* MCQ options */}
            {q.type === "mcq" && (
              <div className="space-y-2">
                <p className="text-xs text-slate-400">
                  Options — click the circle to mark correct answer
                </p>
                {q.options.map((opt, oi) => (
                  <div key={oi} className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => updateQ(q._id, { correctAnswer: opt })}
                      aria-label={`Mark option ${oi + 1} as correct`}
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                        q.correctAnswer === opt
                          ? "border-indigo-400 bg-indigo-400"
                          : "border-white/20 hover:border-indigo-400/50"
                      }`}
                    >
                      {q.correctAnswer === opt && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </button>
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
                      className="flex-1 px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 outline-none focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* True/False */}
            {q.type === "truefalse" && (
              <div className="flex gap-4">
                {["True", "False"].map((val) => (
                  <label
                    key={val}
                    className="flex items-center gap-2.5 cursor-pointer"
                  >
                    <button
                      type="button"
                      onClick={() => updateQ(q._id, { correctAnswer: val })}
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                        q.correctAnswer === val
                          ? "border-indigo-400 bg-indigo-400"
                          : "border-white/20"
                      }`}
                    >
                      {q.correctAnswer === val && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </button>
                    <span className="text-sm text-slate-300">{val}</span>
                  </label>
                ))}
              </div>
            )}

            {/* Short answer */}
            {q.type === "short" && (
              <p className="text-xs text-slate-500 italic bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                Short answer — will be manually graded by instructor.
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setQuestions((p) => [...p, emptyQ()])}
          className="flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
        >
          <Plus className="w-4 h-4" /> Add question
        </button>
        <button
          type="button"
          onClick={save}
          disabled={!title.trim() || loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-blue-600 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-all hover:opacity-90"
        >
          {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          {loading ? "Saving…" : "Save assessment"}
        </button>
      </div>
    </div>
  );
}
