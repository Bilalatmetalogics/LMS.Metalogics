"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[AppError]", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center px-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/20 border border-red-400/30">
        <AlertTriangle className="h-7 w-7 text-red-400" />
      </div>

      <div>
        <h2 className="text-xl font-bold text-white">Something went wrong</h2>
        <p className="mt-2 text-sm text-slate-400 max-w-md">
          {error.message ||
            "An unexpected error occurred. This has been logged."}
        </p>
        {error.digest && (
          <p className="mt-1 text-[10px] text-slate-600 font-mono">
            Error ID: {error.digest}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-400/30 rounded-xl transition-all"
        >
          <RefreshCw className="h-4 w-4" />
          Try again
        </button>
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
        >
          <Home className="h-4 w-4" />
          Go to dashboard
        </Link>
      </div>
    </div>
  );
}
