"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import {
  CheckCircle2,
  PlayCircle,
  ClipboardList,
  ChevronRight,
  Link2,
  FileText,
  Youtube,
  Lock,
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/courses/${params.id}`).then((r) => r.json()),
      fetch(`/api/progress?courseId=${params.id}`).then((r) => r.json()),
      fetch(`/api/assessments?courseId=${params.id}`).then((r) => r.json()),
    ])
      .then(([c, p, a]) => {
        setCourse({ ...c, modules: c.modules ?? [] });
        setProgressList(p);
        setAssessments(a);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  if (loading) return null;
  if (!course)
    return <div className="text-sm text-zinc-400 p-6">Course not found.</div>;

  const allItems = (course.modules ?? []).flatMap((m) => m.videos ?? []);
  const progressMap: Record<string, Progress> = {};
  progressList.forEach((p) => {
    progressMap[p.videoId] = p;
  });

  const completedCount = progressList.filter((p) => p.completed).length;
  const total = allItems.length;
  const pct = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  const assessmentByModule: Record<string, Assessment> = {};
  assessments.forEach((a) => {
    assessmentByModule[a.moduleId] = a;
  });

  // Staff (admin/instructor) always see assessment links — only students are gated
  const isStudent = user?.role === "student";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Breadcrumbs
        items={[
          { label: "Courses", href: "/courses" },
          { label: course.title },
        ]}
      />

      {/* Course header */}
      <div className="bg-white border border-zinc-200 rounded-xl p-6 space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-zinc-900">
              {course.title}
            </h1>
            <p className="text-sm text-zinc-500 mt-1">{course.description}</p>
          </div>
          <Badge>{course.category}</Badge>
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span>
              {completedCount} / {total} items completed
            </span>
          </div>
          <ProgressBar value={pct} showLabel />
        </div>
        <Link
          href={`/courses/${params.id}/learn`}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {completedCount > 0 ? "Continue learning" : "Start course"}
          <ChevronRight className="w-4 h-4" />
        </Link>
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
          // Assessment is unlocked when all module content is completed (students only)
          const assessmentUnlocked = !isStudent || allModDone;

          return (
            <div
              key={mod._id}
              className="bg-white border border-zinc-200 rounded-xl overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-zinc-100 flex items-center justify-between">
                <p className="text-sm font-semibold text-zinc-900">
                  {mod.title}
                </p>
                <span className="text-xs text-zinc-400">
                  {modCompleted}/{modVideos.length} done
                </span>
              </div>
              <ul className="divide-y divide-zinc-100">
                {modVideos.map((v) => (
                  <li
                    key={v._id}
                    className="px-4 py-2.5 flex items-center gap-3"
                  >
                    {progressMap[v._id]?.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                    ) : v.type === "youtube" ? (
                      <Youtube className="w-4 h-4 text-red-400 shrink-0" />
                    ) : v.type === "link" ? (
                      <Link2 className="w-4 h-4 text-blue-400 shrink-0" />
                    ) : v.type === "pdf" ? (
                      <FileText className="w-4 h-4 text-orange-400 shrink-0" />
                    ) : (
                      <PlayCircle className="w-4 h-4 text-zinc-300 shrink-0" />
                    )}
                    <span className="text-sm text-zinc-700">{v.title}</span>
                    {v.duration > 0 && (
                      <span className="text-xs text-zinc-400 ml-auto">
                        {Math.floor(v.duration / 60)}m
                      </span>
                    )}
                  </li>
                ))}

                {/* Assessment row */}
                {assessment && (
                  <li className="px-4 py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {assessmentUnlocked ? (
                        <ClipboardList className="w-4 h-4 text-indigo-400 shrink-0" />
                      ) : (
                        <Lock className="w-4 h-4 text-zinc-300 shrink-0" />
                      )}
                      <span
                        className={`text-sm ${assessmentUnlocked ? "text-zinc-700" : "text-zinc-400"}`}
                      >
                        {assessment.title}
                      </span>
                    </div>
                    {assessmentUnlocked ? (
                      <Link
                        href={`/courses/${params.id}/assessment/${assessment._id}`}
                        className="text-xs text-indigo-600 hover:underline"
                      >
                        Take assessment →
                      </Link>
                    ) : (
                      <span className="text-xs text-zinc-400">
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
