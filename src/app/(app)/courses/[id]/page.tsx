"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import {
  CheckCircle2,
  PlayCircle,
  ClipboardList,
  ChevronRight,
} from "lucide-react";

type Video = { _id: string; title: string; duration: number };
type Module = { _id: string; title: string; videos: Video[] };
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
        setCourse(c);
        setProgressList(p);
        setAssessments(a);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  if (loading) return null;
  if (!course)
    return <div className="text-sm text-zinc-400 p-6">Course not found.</div>;

  const allVideos = course.modules.flatMap((m) => m.videos);
  const progressMap: Record<string, Progress> = {};
  progressList.forEach((p) => {
    progressMap[p.videoId] = p;
  });
  const completed = progressList.filter((p) => p.completed).length;
  const total = allVideos.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const assessmentByModule: Record<string, Assessment> = {};
  assessments.forEach((a) => {
    assessmentByModule[a.moduleId] = a;
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Breadcrumbs
        items={[
          { label: "Courses", href: "/courses" },
          { label: course.title },
        ]}
      />
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
              {completed} / {total} videos completed
            </span>
          </div>
          <ProgressBar value={pct} showLabel />
        </div>
        <Link
          href={`/courses/${params.id}/learn`}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {completed > 0 ? "Continue learning" : "Start course"}
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="space-y-3">
        {course.modules.map((mod) => {
          const modCompleted = mod.videos.filter(
            (v) => progressMap[v._id]?.completed,
          ).length;
          const assessment = assessmentByModule[mod._id];
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
                  {modCompleted}/{mod.videos.length} done
                </span>
              </div>
              <ul className="divide-y divide-zinc-100">
                {mod.videos.map((v) => (
                  <li
                    key={v._id}
                    className="px-4 py-2.5 flex items-center gap-3"
                  >
                    {progressMap[v._id]?.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
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
                {assessment && (
                  <li className="px-4 py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <ClipboardList className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span className="text-sm text-zinc-700">
                        {assessment.title}
                      </span>
                    </div>
                    <Link
                      href={`/courses/${params.id}/assessment/${assessment._id}`}
                      className="text-xs text-indigo-600 hover:underline"
                    >
                      Take assessment →
                    </Link>
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
