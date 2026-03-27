"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { ExternalLink, FileText, Loader2 } from "lucide-react";

type ContentType = "video" | "youtube" | "link" | "pdf";

type ContentItem = {
  _id: string;
  title: string;
  url: string;
  type: ContentType;
  duration: number;
  description?: string;
};

function getYouTubeId(url: string): string | null {
  const m = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
  );
  return m?.[1] ?? null;
}

/**
 * Fetches a signed (or passthrough) URL from /api/media/[videoId].
 * Returns null while loading, the resolved URL once ready.
 */
function useSecureUrl(item: ContentItem, courseId: string): string | null {
  const [secureUrl, setSecureUrl] = useState<string | null>(null);

  useEffect(() => {
    // YouTube and external links don't need signing — use directly
    if (item.type === "youtube" || item.type === "link") {
      setSecureUrl(item.url);
      return;
    }

    setSecureUrl(null);
    let cancelled = false;

    fetch(`/api/media/${item._id}?courseId=${courseId}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setSecureUrl(data.url ?? item.url);
      })
      .catch(() => {
        if (!cancelled) setSecureUrl(item.url); // fallback
      });

    return () => {
      cancelled = true;
    };
  }, [item._id, item.type, item.url, courseId]);

  return secureUrl;
}

export default function ContentViewer({
  item,
  courseId,
  initialProgress,
  onProgressSaved,
}: {
  item: ContentItem;
  courseId: string;
  initialProgress: number;
  onProgressSaved?: () => void;
}) {
  const type = item.type || "video";
  const secureUrl = useSecureUrl(item, courseId);

  return (
    <div className="space-y-4 max-w-3xl">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900">{item.title}</h2>
        {item.description && (
          <p className="text-sm text-zinc-500 mt-1">{item.description}</p>
        )}
      </div>

      {!secureUrl ? (
        <div className="flex items-center justify-center h-48 rounded-xl border border-zinc-200 bg-zinc-50">
          <Loader2 className="w-5 h-5 text-zinc-400 animate-spin" />
        </div>
      ) : (
        <>
          {type === "video" && (
            <VideoContent
              item={item}
              resolvedUrl={secureUrl}
              courseId={courseId}
              initialProgress={initialProgress}
              onProgressSaved={onProgressSaved}
            />
          )}
          {type === "youtube" && <YouTubeContent item={item} />}
          {type === "link" && (
            <LinkContent item={item} resolvedUrl={secureUrl} />
          )}
          {type === "pdf" && <PdfContent item={item} resolvedUrl={secureUrl} />}
        </>
      )}
    </div>
  );
}

// ── Native video with progress tracking ──────────────────────────────────────

function VideoContent({
  item,
  resolvedUrl,
  courseId,
  initialProgress,
  onProgressSaved,
}: {
  item: ContentItem;
  resolvedUrl: string;
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
            videoId: item._id,
            courseId,
            watchedSeconds: Math.floor(currentTime),
            totalSeconds: Math.floor(duration),
          }),
        });
        lastSaved.current = currentTime;
        onProgressSaved?.();
      } catch {}
    },
    [item._id, courseId, onProgressSaved],
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
  }, [item._id, initialProgress, saveProgress]);

  const pct =
    item.duration > 0
      ? Math.min((initialProgress / item.duration) * 100, 100)
      : 0;

  return (
    <>
      {pct > 0 && (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1 bg-zinc-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-xs text-zinc-400">{Math.round(pct)}%</span>
        </div>
      )}
      <video
        ref={videoRef}
        src={resolvedUrl}
        controls
        className="w-full rounded-xl border border-zinc-200 bg-black aspect-video"
        controlsList="nodownload"
      />
    </>
  );
}

// ── YouTube embed ─────────────────────────────────────────────────────────────

function YouTubeContent({ item }: { item: ContentItem }) {
  const videoId = getYouTubeId(item.url);

  if (!videoId) {
    return (
      <div className="rounded-xl border border-zinc-200 p-6 text-center text-sm text-zinc-400">
        Invalid YouTube URL.{" "}
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-600 hover:underline"
        >
          Open link
        </a>
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden border border-zinc-200 aspect-video">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}`}
        title={item.title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full"
      />
    </div>
  );
}

// ── External link ─────────────────────────────────────────────────────────────

function LinkContent({
  item,
  resolvedUrl,
}: {
  item: ContentItem;
  resolvedUrl: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
          <ExternalLink className="w-5 h-5 text-blue-500" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-zinc-900">{item.title}</p>
          <p className="text-xs text-zinc-400 truncate">{resolvedUrl}</p>
        </div>
      </div>
      <a
        href={resolvedUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
      >
        <ExternalLink className="w-4 h-4" />
        Open resource
      </a>
    </div>
  );
}

// ── PDF viewer ────────────────────────────────────────────────────────────────

function PdfContent({
  item,
  resolvedUrl,
}: {
  item: ContentItem;
  resolvedUrl: string;
}) {
  return (
    <div className="space-y-3">
      <div
        className="rounded-xl border border-zinc-200 overflow-hidden"
        style={{ height: "70vh" }}
      >
        <iframe
          src={`${resolvedUrl}#toolbar=1`}
          title={item.title}
          className="w-full h-full"
        />
      </div>
      <a
        href={resolvedUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:underline"
      >
        <FileText className="w-4 h-4" />
        Open PDF in new tab
      </a>
    </div>
  );
}
