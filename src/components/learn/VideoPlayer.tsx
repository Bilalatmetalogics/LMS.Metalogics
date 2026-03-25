"use client";

import { useRef, useEffect, useCallback } from "react";

type Video = { _id: string; title: string; url: string; duration: number };

export default function VideoPlayer({
  video,
  courseId,
  initialProgress,
  onProgressSaved,
}: {
  video: Video;
  courseId: string;
  initialProgress: number;
  onProgressSaved?: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastSaved = useRef(0);

  const saveProgress = useCallback(
    async (currentTime: number, duration: number) => {
      if (!duration) return;
      try {
        await fetch("/api/progress", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            videoId: video._id,
            courseId,
            watchedSeconds: Math.floor(currentTime),
            totalSeconds: Math.floor(duration),
          }),
        });
        lastSaved.current = currentTime;
        onProgressSaved?.();
      } catch {}
    },
    [video._id, courseId, onProgressSaved],
  );

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (initialProgress > 0) el.currentTime = initialProgress;

    const interval = setInterval(() => {
      if (!el.paused && Math.abs(el.currentTime - lastSaved.current) >= 10) {
        saveProgress(el.currentTime, el.duration);
      }
    }, 10000);

    const onPause = () => saveProgress(el.currentTime, el.duration);
    const onEnded = () => saveProgress(el.duration, el.duration);
    el.addEventListener("pause", onPause);
    el.addEventListener("ended", onEnded);

    return () => {
      clearInterval(interval);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("ended", onEnded);
      if (el.currentTime > 0) saveProgress(el.currentTime, el.duration);
    };
  }, [video._id, initialProgress, saveProgress]);

  const pct =
    video.duration > 0
      ? Math.min((initialProgress / video.duration) * 100, 100)
      : 0;

  return (
    <div className="space-y-4 max-w-3xl">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900">{video.title}</h2>
        {pct > 0 && (
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 h-1 bg-zinc-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-xs text-zinc-400">{Math.round(pct)}%</span>
          </div>
        )}
      </div>
      <video
        ref={videoRef}
        src={video.url}
        controls
        className="w-full rounded-xl border border-zinc-200 bg-black aspect-video"
        controlsList="nodownload"
      />
    </div>
  );
}
