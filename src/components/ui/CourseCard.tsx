"use client";

import Link from "next/link";

// Deterministic gradient from course title — gives each card a unique color
const GRADIENTS = [
  "from-violet-600 to-indigo-700",
  "from-blue-600 to-cyan-600",
  "from-emerald-600 to-teal-700",
  "from-orange-500 to-rose-600",
  "from-pink-600 to-purple-700",
  "from-amber-500 to-orange-600",
  "from-sky-500 to-blue-700",
  "from-teal-500 to-emerald-700",
];

function gradientFor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++)
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
}

// Short category abbreviation for the thumbnail
function abbrev(str: string) {
  return str
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 3);
}

type Props = {
  id: string;
  title: string;
  description?: string;
  category: string;
  pct?: number; // 0-100, undefined = not started
  href: string;
  ctaLabel?: string;
};

export default function CourseCard({
  id,
  title,
  description,
  category,
  pct,
  href,
  ctaLabel,
}: Props) {
  const gradient = gradientFor(id + title);
  const started = pct !== undefined && pct > 0;
  const done = pct === 100;

  return (
    <Link
      href={href}
      className="group relative flex flex-col rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
    >
      {/* Thumbnail */}
      <div
        className={`relative h-40 bg-gradient-to-br ${gradient} flex flex-col items-center justify-center overflow-hidden`}
      >
        {/* Decorative circles */}
        <div className="absolute -top-6 -right-6 w-28 h-28 bg-white/10 rounded-full" />
        <div className="absolute -bottom-8 -left-4 w-24 h-24 bg-black/10 rounded-full" />

        {/* Category badge */}
        <span className="absolute top-3 left-3 px-2 py-0.5 bg-black/30 text-white text-[10px] font-bold rounded-full backdrop-blur-sm">
          {category}
        </span>

        {/* Done badge */}
        {done && (
          <span className="absolute top-3 right-3 px-2 py-0.5 bg-emerald-500 text-white text-[10px] font-bold rounded-full">
            ✓ Complete
          </span>
        )}

        {/* Center abbrev */}
        <span className="text-white/20 font-black text-6xl select-none tracking-tighter">
          {abbrev(category)}
        </span>

        {/* Hover play overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg scale-90 group-hover:scale-100 transition-transform duration-200">
            <svg
              className="w-5 h-5 text-indigo-700 ml-0.5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>

        {/* Progress bar overlaid at bottom of thumbnail */}
        {pct !== undefined && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
            <div
              className="h-full bg-white transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="flex flex-col flex-1 p-4">
        <h3 className="font-semibold text-zinc-900 text-sm leading-snug line-clamp-2 group-hover:text-indigo-700 transition-colors">
          {title}
        </h3>
        {description && (
          <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
            {description}
          </p>
        )}

        <div className="mt-auto pt-3 flex items-center justify-between">
          {pct !== undefined ? (
            <span className="text-xs text-zinc-500">
              {done
                ? "Completed"
                : started
                  ? `${pct}% complete`
                  : "Not started"}
            </span>
          ) : (
            <span className="text-xs text-zinc-400">&nbsp;</span>
          )}
          <span className="text-xs font-semibold text-indigo-600 group-hover:underline">
            {ctaLabel ??
              (started && !done ? "Continue →" : done ? "Review →" : "Start →")}
          </span>
        </div>
      </div>
    </Link>
  );
}
