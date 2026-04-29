"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import Link from "next/link";
import {
  Award,
  Clock,
  CheckCircle2,
  Download,
  ArrowLeft,
  Loader2,
  Send,
} from "lucide-react";

type Certificate = {
  _id: string;
  status: "pending" | "approved" | "rejected";
  issuedAt?: string;
  createdAt: string;
  userId: { name: string; email: string };
  courseId: { title: string; category: string };
  approvedBy?: { name: string };
  displayName?: string;
  displayCourseTitle?: string;
  displayDuration?: string;
};

export default function CertificatePage() {
  const { id: courseId } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [cert, setCert] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState("");

  useEffect(() => {
    fetch(`/api/certificates?courseId=${courseId}`)
      .then((r) => r.json())
      .then((data: Certificate[]) => {
        if (data.length > 0) setCert(data[0]);
        else setNotFound(true);
        setLoading(false);
      })
      .catch(() => {
        setNotFound(true);
        setLoading(false);
      });
  }, [courseId]);

  async function applyCertificate() {
    setApplying(true);
    setApplyError("");
    const res = await fetch("/api/certificates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId }),
    });
    const data = await res.json();
    if (res.ok) {
      setCert(data);
      setNotFound(false);
    } else {
      setApplyError(data.error || "Failed to submit request");
    }
    setApplying(false);
  }

  if (loading)
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
      </div>
    );

  // No certificate yet — show apply button
  if (notFound || !cert) {
    return (
      <div className="max-w-lg mx-auto text-center py-24 space-y-6 text-white">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/20 border border-amber-400/30">
          <Award className="h-7 w-7 text-amber-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">
            Apply for Certificate
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            You've completed this course. Submit a certificate request for admin
            review.
          </p>
        </div>
        {applyError && (
          <p className="text-xs text-red-400 bg-red-500/10 border border-red-400/30 rounded-xl px-3 py-2">
            {applyError}
          </p>
        )}
        <div className="flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={applyCertificate}
            disabled={applying}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-blue-600 text-white text-sm font-semibold rounded-xl shadow-lg hover:opacity-90 transition-all disabled:opacity-60"
          >
            {applying ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {applying ? "Submitting…" : "Submit certificate request"}
          </button>
          <Link
            href={`/courses/${courseId}`}
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to course
          </Link>
        </div>
      </div>
    );
  }

  // Resolve display values — admin overrides take priority
  const displayName = cert.displayName || cert.userId.name;
  const displayCourseTitle = cert.displayCourseTitle || cert.courseId.title;
  const displayDuration = cert.displayDuration;

  return (
    <div className="max-w-2xl mx-auto space-y-6 text-white">
      <Link
        href={`/courses/${courseId}`}
        className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to course
      </Link>

      {/* Status card */}
      <div
        className={`rounded-2xl border p-6 backdrop-blur-xl ${
          cert.status === "approved"
            ? "bg-emerald-500/10 border-emerald-400/30"
            : cert.status === "rejected"
              ? "bg-red-500/10 border-red-400/30"
              : "bg-amber-500/10 border-amber-400/30"
        }`}
      >
        <div className="flex items-center gap-3">
          {cert.status === "approved" ? (
            <CheckCircle2 className="h-6 w-6 text-emerald-400 shrink-0" />
          ) : cert.status === "rejected" ? (
            <Award className="h-6 w-6 text-red-400 shrink-0" />
          ) : (
            <Clock className="h-6 w-6 text-amber-400 shrink-0" />
          )}
          <div>
            <p className="font-semibold text-white">
              {cert.status === "approved"
                ? "Certificate approved — ready to download"
                : cert.status === "rejected"
                  ? "Certificate request rejected"
                  : "Pending admin approval"}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              {cert.status === "approved"
                ? `Approved on ${new Date(cert.issuedAt!).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`
                : cert.status === "rejected"
                  ? "Contact your administrator for more information"
                  : `Submitted ${new Date(cert.createdAt).toLocaleDateString()} — your admin will review shortly`}
            </p>
          </div>
        </div>
      </div>

      {/* Certificate — only when approved */}
      {cert.status === "approved" && (
        <>
          <div id="certificate-print" className="certificate-container">
            <div className="relative overflow-hidden rounded-3xl border-2 border-indigo-400/40 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-10 text-center shadow-2xl">
              {/* Decorative corners */}
              <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-indigo-400/40 rounded-tl-xl" />
              <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-indigo-400/40 rounded-tr-xl" />
              <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-indigo-400/40 rounded-bl-xl" />
              <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-indigo-400/40 rounded-br-xl" />

              {/* Brand */}
              <div className="flex justify-center mb-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 shadow-lg">
                  <Award className="h-7 w-7 text-white" />
                </div>
              </div>

              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-300/80 mb-2">
                MetaLogics LMS
              </p>
              <h1 className="text-2xl font-bold text-white mb-1">
                Certificate of Completion
              </h1>
              <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-indigo-400 to-transparent mx-auto my-6" />

              <p className="text-sm text-slate-400 mb-2">This certifies that</p>
              <p className="text-3xl font-bold text-white mb-2">
                {displayName}
              </p>
              <p className="text-sm text-slate-400 mb-6">
                has successfully completed
              </p>
              <p className="text-xl font-semibold text-indigo-300 mb-1">
                {displayCourseTitle}
              </p>

              {cert.courseId.category && (
                <p className="text-xs text-slate-500 mb-1">
                  {cert.courseId.category}
                </p>
              )}
              {displayDuration && (
                <p className="text-xs text-slate-400 mb-6">
                  Duration: {displayDuration}
                </p>
              )}
              {!displayDuration && <div className="mb-8" />}

              <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-indigo-400/40 to-transparent mx-auto mb-6" />

              <div className="flex items-center justify-center gap-8 text-xs text-slate-400">
                <div>
                  <p className="font-semibold text-white">
                    {new Date(cert.issuedAt!).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <p>Date of Issue</p>
                </div>
                {cert.approvedBy && (
                  <div>
                    <p className="font-semibold text-white">
                      {cert.approvedBy.name}
                    </p>
                    <p>Authorized by</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-blue-600 text-white text-sm font-semibold rounded-xl shadow-lg hover:opacity-90 hover:-translate-y-0.5 transition-all"
            >
              <Download className="h-4 w-4" />
              Download / Print Certificate
            </button>
          </div>
        </>
      )}
    </div>
  );
}
