"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import ContentViewer from "@/components/learn/ContentViewer";
import CourseSidebar from "@/components/learn/CourseSidebar";

type ContentType = "video" | "youtube" | "link" | "pdf";

type ContentItem = {
  _id: string;
  title: string;
  url: string;
  type: ContentType;
  duration: number;
  description?: string;
  order: number;
};
type Module = {
  _id: string;
  title: string;
  order: number;
  videos: ContentItem[];
};
type Course = { _id: string; title: string; modules: Module[] };
type Progress = {
  videoId: string;
  watchedSeconds: number;
  totalSeconds: number;
  completed: boolean;
};

export default function LearnPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [progressList, setProgressList] = useState<Progress[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadProgress() {
    const res = await fetch(`/api/progress?courseId=${params.id}`);
    if (res.ok) setProgressList(await res.json());
  }

  useEffect(() => {
    Promise.all([
      fetch(`/api/courses/${params.id}`).then((r) => r.json()),
      fetch(`/api/progress?courseId=${params.id}`).then((r) => r.json()),
    ])
      .then(([c, p]) => {
        setCourse(c);
        setProgressList(p);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  if (loading || !course) return null;

  const allItems = course.modules.flatMap((m) => m.videos);
  const progressMap: Record<string, Progress> = {};
  progressList.forEach((p) => {
    progressMap[p.videoId] = p;
  });

  // Unlock logic: first item always unlocked; each subsequent unlocks after prev completed.
  // Non-video items (link, pdf, youtube) are auto-completed on first view (handled in ContentViewer).
  const unlockedIds = new Set<string>();
  for (let i = 0; i < allItems.length; i++) {
    if (i === 0) {
      unlockedIds.add(allItems[i]._id);
      continue;
    }
    if (progressMap[allItems[i - 1]._id]?.completed)
      unlockedIds.add(allItems[i]._id);
  }

  const activeItemId = searchParams.get("video") || allItems[0]?._id;
  const activeItem = allItems.find((v) => v._id === activeItemId);

  return (
    <div className="flex h-full gap-0 -m-6">
      <CourseSidebar
        course={course}
        activeVideoId={activeItemId}
        unlockedIds={Array.from(unlockedIds)}
        progressMap={progressMap}
      />
      <div className="flex-1 overflow-y-auto p-6">
        {activeItem ? (
          <ContentViewer
            item={activeItem}
            courseId={params.id}
            initialProgress={progressMap[activeItemId]?.watchedSeconds || 0}
            onProgressSaved={loadProgress}
          />
        ) : (
          <div className="flex items-center justify-center h-64 text-sm text-zinc-400">
            No content available.
          </div>
        )}
      </div>
    </div>
  );
}
