/**
 * Lightweight in-memory rate limiter for Next.js API routes.
 *
 * Uses a sliding window counter per identifier (IP or user ID).
 * Stored in a module-level Map — persists across requests within
 * the same Node.js process (works fine for a single-server deployment).
 *
 * For multi-instance deployments, swap the store for Redis.
 */

interface Window {
  count: number;
  resetAt: number; // unix ms
}

const store = new Map<string, Window>();

// Clean up expired entries every 5 minutes to prevent memory leaks
setInterval(
  () => {
    const now = Date.now();
    for (const [key, win] of store.entries()) {
      if (win.resetAt < now) store.delete(key);
    }
  },
  5 * 60 * 1000,
);

export interface RateLimitOptions {
  /** Max requests allowed in the window */
  limit: number;
  /** Window duration in seconds */
  windowSec: number;
  /** Unique key for this limiter (e.g. "login", "upload") */
  prefix: string;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number; // unix ms
}

export function rateLimit(
  identifier: string,
  options: RateLimitOptions,
): RateLimitResult {
  const { limit, windowSec, prefix } = options;
  const key = `${prefix}:${identifier}`;
  const now = Date.now();
  const windowMs = windowSec * 1000;

  const existing = store.get(key);

  if (!existing || existing.resetAt < now) {
    // New window
    const win: Window = { count: 1, resetAt: now + windowMs };
    store.set(key, win);
    return { success: true, remaining: limit - 1, resetAt: win.resetAt };
  }

  existing.count += 1;

  if (existing.count > limit) {
    return { success: false, remaining: 0, resetAt: existing.resetAt };
  }

  return {
    success: true,
    remaining: limit - existing.count,
    resetAt: existing.resetAt,
  };
}

/**
 * Get the client IP from a Next.js request.
 * Checks x-forwarded-for (proxy/Vercel) then falls back to a placeholder.
 */
export function getClientIp(req: Request): string {
  const forwarded = (req.headers as any).get?.("x-forwarded-for") as
    | string
    | null;
  if (forwarded) return forwarded.split(",")[0].trim();
  return "unknown";
}

/* ── Pre-configured limiters ─────────────────────────────────── */

/** Login: 10 attempts per 15 minutes per IP */
export const loginLimiter = (ip: string) =>
  rateLimit(ip, { limit: 10, windowSec: 15 * 60, prefix: "login" });

/** User creation: 20 per hour per IP (admin action) */
export const createUserLimiter = (ip: string) =>
  rateLimit(ip, { limit: 20, windowSec: 60 * 60, prefix: "create-user" });

/** File upload: 30 per hour per user */
export const uploadLimiter = (userId: string) =>
  rateLimit(userId, { limit: 30, windowSec: 60 * 60, prefix: "upload" });

/** Progress updates: 120 per minute per user (video heartbeat) */
export const progressLimiter = (userId: string) =>
  rateLimit(userId, { limit: 120, windowSec: 60, prefix: "progress" });

/** Assessment submission: 10 per hour per user */
export const submitLimiter = (userId: string) =>
  rateLimit(userId, { limit: 10, windowSec: 60 * 60, prefix: "submit" });

/** General API: 200 per minute per IP */
export const generalLimiter = (ip: string) =>
  rateLimit(ip, { limit: 200, windowSec: 60, prefix: "general" });
