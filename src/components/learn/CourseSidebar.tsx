"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  PlayCircle,
  Lock,
  Link2,
  FileText,
  Youtube,
} from "lucide-react";

type ContentType = "video" | "youtube" | "link" | "pdf";
type ContentItem = {
  _id: string;
  title: string;
  type: ContentType;
  order: number;
  duration: number;
};
type Module = {
  _id: string;
  title: string;
  order: number;
  videos: ContentItem[];
};

function ItemIcon({
  type,
  completed,
  active,
}: {
  type: ContentType;
  completed?: boolean;
  active?: boolean;
}) {
  if (completed)
    return (
      <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-emerald-400" />
    );
  const cls = cn(
    "w-4 h-4 mt-0.5 shrink-0",
    active ? "text-indigo-300" : "text-slate-500",
  );
  switch (type) {
    case "youtube":
      return <Youtube className={cls} />;
    case "link":
      return <Link2 className={cls} />;
    case "pdf":
      return <FileText className={cls} />;
    default:
      return <PlayCircle className={cls} />;
  }
}

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
    <aside className="w-72 shrink-0 border-r border-white/10 bg-slate-900/80 backdrop-blur-xl overflow-y-auto">
      {/* Course title */}
      <div className="px-4 py-3.5 border-b border-white/10">
        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-0.5">
          Course
        </p>
        <p className="text-sm font-semibold text-white line-clamp-2">
          {course.title}
        </p>
      </div>

      <div className="py-2">
        {course.modules.map((mod) => (
          <div key={mod._id.toString()}>
            <p className="px-4 py-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              {mod.title}
            </p>
            {mod.videos.map((item) => {
              const vid = item._id.toString();
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
              const type = item.type || "video";

              return (
                <div key={vid}>
                  {unlocked ? (
                    <Link
                      href={`/courses/${course._id}/learn?video=${vid}`}
                      className={cn(
                        "flex items-start gap-3 px-4 py-2.5 text-sm transition-all",
                        isActive
                          ? "bg-indigo-500/15 border-l-2 border-indigo-400 text-indigo-300"
                          : "text-slate-300 hover:bg-white/5 hover:text-white border-l-2 border-transparent",
                      )}
                    >
                      <ItemIcon
                        type={type}
                        completed={progress?.completed}
                        active={isActive}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm leading-snug line-clamp-2">
                          {item.title}
                        </p>
                        {type === "video" && pct > 0 && (
                          <div className="mt-1.5 h-0.5 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-400 rounded-full"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </Link>
                  ) : (
                    <div className="flex items-start gap-3 px-4 py-2.5 text-sm opacity-30 cursor-not-allowed border-l-2 border-transparent">
                      <Lock className="w-4 h-4 mt-0.5 shrink-0 text-slate-500" />
                      <p className="text-sm leading-snug line-clamp-2 text-slate-500">
                        {item.title}
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
