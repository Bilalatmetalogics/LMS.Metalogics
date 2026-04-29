import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse rounded-md bg-white/8", className)} />
  );
}

/* ── Composite skeletons ─────────────────────────────────────── */

export function StatCardSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/10 rounded-t-2xl" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
      <div className="mt-4 space-y-2">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}

export function HeroBannerSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 sm:p-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div className="space-y-3">
          <Skeleton className="h-5 w-32 rounded-full" />
          <Skeleton className="h-10 w-72" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
        <div className="flex gap-3 shrink-0">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 min-w-[100px]">
            <Skeleton className="h-7 w-10 mx-auto" />
            <Skeleton className="h-3 w-14 mx-auto mt-2" />
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 min-w-[100px]">
            <Skeleton className="h-7 w-10 mx-auto" />
            <Skeleton className="h-3 w-14 mx-auto mt-2" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function CourseTileSkeleton() {
  return (
    <div className="flex-shrink-0 w-64 sm:w-72 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
      <Skeleton className="aspect-video w-full rounded-none" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="pt-1 space-y-1.5">
          <div className="flex justify-between">
            <Skeleton className="h-2.5 w-12" />
            <Skeleton className="h-2.5 w-8" />
          </div>
          <Skeleton className="h-1 w-full rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function CourseRowSkeleton({ count = 3 }: { count?: number }) {
  return (
    <section className="space-y-4">
      <Skeleton className="h-6 w-40" />
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: count }).map((_, i) => (
          <CourseTileSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}

export function TableRowSkeleton({ cols = 4 }: { cols?: number }) {
  return (
    <tr className="border-b border-white/5">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-5 py-4">
          <Skeleton className={`h-4 ${i === 0 ? "w-40" : "w-20"}`} />
        </td>
      ))}
    </tr>
  );
}

export function QuickCardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-3">
      <Skeleton className="h-11 w-11 rounded-xl" />
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-3 w-36" />
    </div>
  );
}
