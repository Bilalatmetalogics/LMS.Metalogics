"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { CheckCircle2, PlayCircle, Lock } from "lucide-react";

type Video = { _id: string; title: string; order: number; duration: number };
type Module = { _id: string; title: string; order: number; videos: Video[] };

export default function CourseSidebar({
  course,
  activeVideoId,
  unlockedIds,
  progressMap,
}: {
  course: { _id: string; title: string; modules: Module[] };
  activeVideoId: string;
  unlockedIds: string[];
  progressMap: Record<string, any>;
}) {
  const unlockedSet = new Set(unlockedIds);

  return (
    <aside className="w-72 shrink-0 border-r border-zinc-200 bg-white overflow-y-auto">
      <div className="px-4 py-3 border-b border-zinc-100">
        <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium">
          Course
        </p>
        <p className="text-sm font-semibold text-zinc-900 mt-0.5 line-clamp-2">
          {course.title}
        </p>
      </div>
      <div className="py-2">
        {course.modules.map((mod) => (
          <div key={mod._id.toString()}>
            <p className="px-4 py-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              {mod.title}
            </p>
            {mod.videos.map((video) => {
              const vid = video._id.toString();
              const unlocked = unlockedSet.has(vid);
              const progress = progressMap[vid];
              const pct =
                progress && progress.totalSeconds > 0
                  ? Math.min(
                      (progress.watchedSeconds / progress.totalSeconds) * 100,
                      100,
                    )
                  : 0;
              const isActive = vid === activeVideoId;

              return (
                <div key={vid} className="relative">
                  {unlocked ? (
                    <Link
                      href={`/courses/${course._id}/learn?video=${vid}`}
                      className={cn(
                        "flex items-start gap-3 px-4 py-2.5 text-sm transition-colors",
                        isActive
                          ? "bg-indigo-50 text-indigo-700"
                          : "text-zinc-700 hover:bg-zinc-50",
                      )}
                    >
                      <VideoIcon
                        completed={progress?.completed}
                        active={isActive}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm leading-snug line-clamp-2">
                          {video.title}
                        </p>
                        {pct > 0 && (
                          <div className="mt-1 h-0.5 bg-zinc-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-400 rounded-full"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </Link>
                  ) : (
                    <div className="flex items-start gap-3 px-4 py-2.5 text-sm opacity-40 cursor-not-allowed">
                      <LockIcon />
                      <p className="text-sm leading-snug line-clamp-2 text-zinc-500">
                        {video.title}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </aside>
  );
}

function VideoIcon({
  completed,
  active,
}: {
  completed?: boolean;
  active?: boolean;
}) {
  if (completed)
    return <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-green-500" />;
  return (
    <PlayCircle
      className={cn(
        "w-4 h-4 mt-0.5 shrink-0",
        active ? "text-indigo-600" : "text-zinc-400",
      )}
    />
  );
}

function LockIcon() {
  return <Lock className="w-4 h-4 mt-0.5 shrink-0 text-zinc-400" />;
}
