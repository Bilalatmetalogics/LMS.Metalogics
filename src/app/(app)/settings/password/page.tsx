"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import { KeyRound, Eye, EyeOff, CheckCircle2, Loader2 } from "lucide-react";

export default function ChangePasswordPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const isForcedChange = (user as any)?.mustChangePassword;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (form.newPassword.length < 8) {
      setError("New password must be at least 8 characters");
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (form.currentPassword === form.newPassword) {
      setError("New password must be different from current password");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/users/me/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      }),
    });
    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      setSuccess(true);
      setTimeout(() => router.push("/dashboard"), 2000);
    } else {
      setError(data.error || "Failed to update password");
    }
  }

  if (!user) return null;

  return (
    <div className="max-w-md mx-auto">
      {/* Forced change banner */}
      {isForcedChange && (
        <div className="mb-6 flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <span className="text-amber-500 text-lg mt-0.5">⚠️</span>
          <div>
            <p className="text-sm font-semibold text-amber-800">
              Password change required
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              You're using a temporary password. Please set a new one to
              continue.
            </p>
          </div>
        </div>
      )}

      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-zinc-100 flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-50 rounded-lg flex items-center justify-center">
            <KeyRound className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-900">
              Change password
            </p>
            <p className="text-xs text-zinc-400 mt-0.5">{user.email}</p>
          </div>
        </div>

        {success ? (
          <div className="px-6 py-10 flex flex-col items-center gap-3 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            <p className="text-sm font-semibold text-zinc-900">
              Password updated
            </p>
            <p className="text-xs text-zinc-400">Redirecting to dashboard...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            {/* Current password */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-600">
                Current password
              </label>
              <div className="relative">
                <input
                  type={showCurrent ? "text" : "password"}
                  value={form.currentPassword}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, currentPassword: e.target.value }))
                  }
                  required
                  placeholder="Enter current password"
                  className="w-full px-3 py-2 pr-10 text-sm border border-zinc-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  {showCurrent ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* New password */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-600">
                New password
              </label>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  value={form.newPassword}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, newPassword: e.target.value }))
                  }
                  required
                  placeholder="Min. 8 characters"
                  className="w-full px-3 py-2 pr-10 text-sm border border-zinc-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  {showNew ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {/* Strength indicator */}
              {form.newPassword && (
                <PasswordStrength password={form.newPassword} />
              )}
            </div>

            {/* Confirm */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-600">
                Confirm new password
              </label>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(e) =>
                  setForm((p) => ({ ...p, confirmPassword: e.target.value }))
                }
                required
                placeholder="Repeat new password"
                className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {form.confirmPassword &&
                form.newPassword !== form.confirmPassword && (
                  <p className="text-xs text-red-500">Passwords don't match</p>
                )}
            </div>

            <div className="flex items-center justify-between pt-2">
              {!isForcedChange && (
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="text-sm text-zinc-500 hover:text-zinc-700"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className="ml-auto px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {loading ? "Updating..." : "Update password"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "8+ characters", pass: password.length >= 8 },
    { label: "Uppercase", pass: /[A-Z]/.test(password) },
    { label: "Number", pass: /\d/.test(password) },
    { label: "Special char", pass: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.pass).length;
  const colors = [
    "bg-red-400",
    "bg-orange-400",
    "bg-yellow-400",
    "bg-emerald-400",
  ];
  const labels = ["Weak", "Fair", "Good", "Strong"];

  return (
    <div className="space-y-1.5 mt-1">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all ${
              i < score ? colors[score - 1] : "bg-zinc-100"
            }`}
          />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {checks.map((c) => (
            <span
              key={c.label}
              className={`text-[10px] ${c.pass ? "text-emerald-600" : "text-zinc-400"}`}
            >
              {c.pass ? "✓" : "·"} {c.label}
            </span>
          ))}
        </div>
        {score > 0 && (
          <span
            className={`text-[10px] font-semibold ${colors[score - 1].replace("bg-", "text-")}`}
          >
            {labels[score - 1]}
          </span>
        )}
      </div>
    </div>
  );
}
