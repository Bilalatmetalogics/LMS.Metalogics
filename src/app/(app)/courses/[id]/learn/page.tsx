"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import VideoPlayer from "@/components/learn/VideoPlayer";
import CourseSidebar from "@/components/learn/CourseSidebar";

type Video = {
  _id: string;
  title: string;
  url: string;
  duration: number;
  order: number;
};
type Module = { _id: string; title: string; order: number; videos: Video[] };
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

  const allVideos = course.modules.flatMap((m) => m.videos);
  const progressMap: Record<string, Progress> = {};
  progressList.forEach((p) => {
    progressMap[p.videoId] = p;
  });

  // Unlock logic: first video always unlocked, next unlocks after prev completed
  const unlockedIds = new Set<string>();
  for (let i = 0; i < allVideos.length; i++) {
    if (i === 0) {
      unlockedIds.add(allVideos[i]._id);
      continue;
    }
    if (progressMap[allVideos[i - 1]._id]?.completed)
      unlockedIds.add(allVideos[i]._id);
  }

  const activeVideoId = searchParams.get("video") || allVideos[0]?._id;
  const activeVideo = allVideos.find((v) => v._id === activeVideoId);

  return (
    <div className="flex h-full gap-0 -m-6">
      <CourseSidebar
        course={course}
        activeVideoId={activeVideoId}
        unlockedIds={Array.from(unlockedIds)}
        progressMap={progressMap}
      />
      <div className="flex-1 overflow-y-auto p-6">
        {activeVideo ? (
          <VideoPlayer
            video={activeVideo}
            courseId={params.id}
            initialProgress={progressMap[activeVideoId]?.watchedSeconds || 0}
            onProgressSaved={loadProgress}
          />
        ) : (
          <div className="flex items-center justify-center h-64 text-sm text-zinc-400">
            No videos available.
          </div>
        )}
      </div>
    </div>
  );
}
