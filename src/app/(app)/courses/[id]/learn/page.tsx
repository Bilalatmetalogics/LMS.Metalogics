"use client";

import { useAuth } from "@/lib/useAuth";
import { db } from "@/lib/mockStore";
import { useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import VideoPlayer from "@/components/learn/VideoPlayer";
import CourseSidebar from "@/components/learn/CourseSidebar";

export default function LearnPage() {
  const { user } = useAuth();
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const [tick, setTick] = useState(0); // force re-render after progress update

  if (!user) return null;

  const course = useMemo(() => db.courses.findById(params.id), [params.id]);
  const progressList = useMemo(
    () => db.progress.forCourse(user.id, params.id),
    [user.id, params.id, tick],
  );

  if (!course)
    return <div className="text-sm text-zinc-400 p-6">Course not found.</div>;

  const allVideos = course.modules.flatMap((m) => m.videos);
  const progressMap: Record<string, any> = {};
  progressList.forEach((p) => {
    progressMap[p.videoId] = p;
  });

  // Unlock logic: first video always unlocked, next unlocks after prev >= 75%
  const unlockedIds = new Set<string>();
  for (let i = 0; i < allVideos.length; i++) {
    if (i === 0) {
      unlockedIds.add(allVideos[i].id);
      continue;
    }
    if (progressMap[allVideos[i - 1].id]?.completed)
      unlockedIds.add(allVideos[i].id);
  }

  const activeVideoId = searchParams.get("video") || allVideos[0]?.id;
  const activeVideo = allVideos.find((v) => v.id === activeVideoId);

  function onProgressSaved() {
    setTick((t) => t + 1); // re-read progress from localStorage
  }

  return (
    <div className="flex h-full gap-0 -m-6">
      <CourseSidebar
        course={{
          _id: course.id,
          title: course.title,
          modules: course.modules.map((m) => ({
            _id: m.id,
            title: m.title,
            order: m.order,
            videos: m.videos.map((v) => ({
              _id: v.id,
              title: v.title,
              order: v.order,
              duration: v.duration,
            })),
          })),
        }}
        activeVideoId={activeVideoId}
        unlockedIds={Array.from(unlockedIds)}
        progressMap={progressMap}
      />
      <div className="flex-1 overflow-y-auto p-6">
        {activeVideo ? (
          <VideoPlayer
            video={{
              _id: activeVideo.id,
              title: activeVideo.title,
              url: activeVideo.url,
              duration: activeVideo.duration,
            }}
            courseId={params.id}
            initialProgress={progressMap[activeVideoId]?.watchedSeconds || 0}
            onProgressSaved={onProgressSaved}
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
