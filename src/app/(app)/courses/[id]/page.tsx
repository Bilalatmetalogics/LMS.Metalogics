"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import {
  CheckCircle2,
  PlayCircle,
  ClipboardList,
  ChevronRight,
  Link2,
  FileText,
  Youtube,
  Lock,
  Award,
  Play,
  Clock,
} from "lucide-react";

type ContentType = "video" | "youtube" | "link" | "pdf";
type ContentItem = {
  _id: string;
  title: string;
  duration: number;
  type?: ContentType;
};
type Module = { _id: string; title: string; videos: ContentItem[] };
type Course = {
  _id: string;
  title: string;
  description: string;
  category: string;
  modules: Module[];
};
type Progress = {
  videoId: string;
  watchedSeconds: number;
  totalSeconds: number;
  completed: boolean;
};
type Assessment = { _id: string; title: string; moduleId: string };

export default function CourseDetailPage() {
  const params = useParams<{ id: string }>();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [progressList, setProgressList] = useState<Progress[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [certStatus, setCertStatus] = useState<
    "none" | "pending" | "approved" | "rejected"
  >("none");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/courses/${params.id}`).then((r) => r.json()),
      fetch(`/api/progress?courseId=${params.id}`).then((r) => r.json()),
      fetch(`/api/assessments?courseId=${params.id}`).then((r) => r.json()),
      fetch(`/api/certificates?courseId=${params.id}`).then((r) => r.json()),
    ])
      .then(([c, p, a, certs]) => {
        setCourse({ ...c, modules: c.modules ?? [] });
        setProgressList(p);
        setAssessments(a);
        if (Array.isArray(certs) && certs.length > 0) {
          setCertStatus(certs[0].status);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  if (loading)
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  if (!course)
    return <div className="text-sm text-slate-400 p-6">Course not found.</div>;

  const allItems = course.modules.flatMap((m) => m.videos ?? []);
  const progressMap: Record<string, Progress> = {};
  progressList.forEach((p) => {
    progressMap[p.videoId] = p;
  });

  const completedCount = progressList.filter((p) => p.completed).length;
  const total = allItems.length;
  const pct = total > 0 ? Math.round((completedCount / total) * 100) : 0;
  const isComplete = pct === 100 && total > 0;

  const assessmentByModule: Record<string, Assessment> = {};
  assessments.forEach((a) => {
    assessmentByModule[a.moduleId] = a;
  });

  const isStudent = user?.role === "student";

  return (
    <div className="max-w-3xl mx-auto space-y-6 text-white">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-400">
        <Link href="/courses" className="hover:text-white transition-colors">
          Courses
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-white">{course.title}</span>
      </nav>

      {/* Course header */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {course.title}
            </h1>
            <p className="text-sm text-slate-400 mt-1 leading-relaxed">
              {course.description}
            </p>
          </div>
          <span className="shrink-0 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300">
            {course.category}
          </span>
        </div>

        {/* Progress bar */}
        {total > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>
                {completedCount} / {total} items completed
              </span>
              <span className="font-semibold text-white">{pct}%</span>
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )}

        {/* CTAs */}
        <div className="flex items-center gap-3 flex-wrap">
          <Link
            href={`/courses/${params.id}/learn`}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-blue-600 text-white text-sm font-semibold rounded-xl shadow-lg transition hover:opacity-90"
          >
            <Play className="h-4 w-4 fill-current" />
            {completedCount > 0 ? "Continue learning" : "Start course"}
          </Link>

          {/* Certificate CTA — only when 100% complete */}
          {isComplete && isStudent && (
            <Link
              href={`/courses/${params.id}/certificate`}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition ${
                certStatus === "approved"
                  ? "bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 hover:bg-emerald-500/25"
                  : certStatus === "pending"
                    ? "bg-amber-500/15 border border-amber-400/30 text-amber-300 hover:bg-amber-500/25"
                    : certStatus === "rejected"
                      ? "bg-red-500/15 border border-red-400/30 text-red-300 hover:bg-red-500/25"
                      : "bg-indigo-500/15 border border-indigo-400/30 text-indigo-300 hover:bg-indigo-500/25"
              }`}
            >
              <Award className="h-4 w-4" />
              {certStatus === "approved"
                ? "Download certificate"
                : certStatus === "pending"
                  ? "Certificate pending"
                  : certStatus === "rejected"
                    ? "Certificate rejected"
                    : "Apply for certificate"}
            </Link>
          )}
        </div>

        {/* Completion / certificate status banner */}
        {isComplete && isStudent && certStatus === "none" && (
          <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-400/30 rounded-xl">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <p className="text-xs text-emerald-300 font-medium">
              🎉 Course complete! Apply for your certificate above.
            </p>
          </div>
        )}
        {isComplete && isStudent && certStatus === "pending" && (
          <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-400/30 rounded-xl">
            <Clock className="h-4 w-4 text-amber-400 shrink-0" />
            <p className="text-xs text-amber-300 font-medium">
              Certificate request submitted — awaiting admin approval.
            </p>
          </div>
        )}
      </div>

      {/* Modules */}
      <div className="space-y-3">
        {course.modules.map((mod) => {
          const modVideos = mod.videos ?? [];
          const modCompleted = modVideos.filter(
            (v) => progressMap[v._id]?.completed,
          ).length;
          const allModDone =
            modVideos.length > 0 && modCompleted === modVideos.length;
          const assessment = assessmentByModule[mod._id];
          const assessmentUnlocked = !isStudent || allModDone;

          return (
            <div
              key={mod._id}
              className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl"
            >
              <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between">
                <p className="text-sm font-semibold text-white">{mod.title}</p>
                <span className="text-xs text-slate-400">
                  {modCompleted}/{modVideos.length} done
                </span>
              </div>
              <ul className="divide-y divide-white/5">
                {modVideos.map((v) => (
                  <li key={v._id} className="px-5 py-3 flex items-center gap-3">
                    {progressMap[v._id]?.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : v.type === "youtube" ? (
                      <Youtube className="w-4 h-4 text-red-400 shrink-0" />
                    ) : v.type === "link" ? (
                      <Link2 className="w-4 h-4 text-blue-400 shrink-0" />
                    ) : v.type === "pdf" ? (
                      <FileText className="w-4 h-4 text-orange-400 shrink-0" />
                    ) : (
                      <PlayCircle className="w-4 h-4 text-slate-500 shrink-0" />
                    )}
                    <span
                      className={`text-sm ${progressMap[v._id]?.completed ? "text-slate-400 line-through" : "text-slate-200"}`}
                    >
                      {v.title}
                    </span>
                    {v.duration > 0 && (
                      <span className="text-xs text-slate-500 ml-auto">
                        {Math.floor(v.duration / 60)}m
                      </span>
                    )}
                  </li>
                ))}

                {assessment && (
                  <li className="px-5 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {assessmentUnlocked ? (
                        <ClipboardList className="w-4 h-4 text-indigo-400 shrink-0" />
                      ) : (
                        <Lock className="w-4 h-4 text-slate-600 shrink-0" />
                      )}
                      <span
                        className={`text-sm ${assessmentUnlocked ? "text-slate-200" : "text-slate-500"}`}
                      >
                        {assessment.title}
                      </span>
                    </div>
                    {assessmentUnlocked ? (
                      <Link
                        href={`/courses/${params.id}/assessment/${assessment._id}`}
                        className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                      >
                        Take assessment →
                      </Link>
                    ) : (
                      <span className="text-xs text-slate-500">
                        Complete all content first
                      </span>
                    )}
                  </li>
                )}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
