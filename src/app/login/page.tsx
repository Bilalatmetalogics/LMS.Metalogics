"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Mail, Lock, ArrowRight, AlertCircle, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (res?.ok) {
        router.push("/dashboard");
      } else {
        setError("Invalid credentials. Please check your email or password.");
        setLoading(false);
      }
    } catch (err: any) {
      // NextAuth throws on rate limit or server error
      const msg = err?.message || "";
      if (msg.includes("Too many")) {
        setError(
          "Too many login attempts. Please wait a few minutes and try again.",
        );
      } else {
        setError("Invalid credentials. Please check your email or password.");
      }
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-primary-deep">
      {/* Mesh gradient backdrop */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-mesh" />
      {/* Animated grid */}
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-40" />

      {/* Floating ambient blobs */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-[28rem] w-[28rem] rounded-full bg-primary-glow/30 blur-3xl animate-blob" />
      <div className="pointer-events-none absolute top-1/3 -right-40 h-[32rem] w-[32rem] rounded-full bg-primary/40 blur-3xl animate-blob animation-delay-2000" />
      <div className="pointer-events-none absolute -bottom-40 left-1/3 h-[26rem] w-[26rem] rounded-full bg-primary-glow/25 blur-3xl animate-blob animation-delay-4000" />

      {/* Vignette */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,oklch(0.1_0.1_265/0.6)_100%)]" />

      <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12">
        {/* Brand wordmark */}
        <div className="mb-8 flex items-center gap-3 animate-fade-up">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-white.png"
              alt="MetaLogics"
              title="MetaLogics"
              className="w-7 h-7 object-contain"
              onError={(e) => {
                const el = e.target as HTMLImageElement;
                el.style.display = "none";
                if (el.parentElement) {
                  el.parentElement.innerHTML =
                    '<span style="color:white;font-weight:900;font-size:20px;line-height:1">M</span>';
                }
              }}
            />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-sm font-black tracking-[0.2em] text-white">
              METALOGICS
            </span>
            <span className="text-[9px] tracking-[0.25em] text-white/50 mt-0.5">
              WEB · MOBILE · AI
            </span>
          </div>
        </div>

        {/* Auth card — white, light */}
        <div className="relative w-full max-w-md animate-fade-up delay-100">
          <div className="rounded-3xl bg-[#f0f2fa] p-8 sm:p-10 shadow-elegant">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1a1b22]">
                Internal Training
              </h1>
              <p className="mt-2 text-sm text-[#464555]">
                Sign in to your account
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-6 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700 animate-fade-up">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-[11px] font-black tracking-[0.15em] text-[#1a1b22]"
                >
                  EMAIL ADDRESS
                </label>
                <div className="group relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#777587] transition-colors group-focus-within:text-[#3525cd]" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@company.com"
                    className="w-full rounded-2xl border border-[#c7c4d8]/40 bg-white py-3.5 pl-11 pr-4 text-sm font-medium text-[#1a1b22] placeholder:text-[#777587]/60 outline-none transition-all focus:border-[#3525cd] focus:ring-4 focus:ring-[#3525cd]/10"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-[11px] font-black tracking-[0.15em] text-[#1a1b22]"
                >
                  PASSWORD
                </label>
                <div className="group relative">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#777587] transition-colors group-focus-within:text-[#3525cd]" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full rounded-2xl border border-[#c7c4d8]/40 bg-white py-3.5 pl-11 pr-4 text-sm font-medium text-[#1a1b22] placeholder:text-[#777587]/60 outline-none transition-all focus:border-[#3525cd] focus:ring-4 focus:ring-[#3525cd]/10"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="group relative mt-2 flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-primary py-4 text-sm font-semibold text-white shadow-elegant transition-all hover:opacity-90 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <nav className="mt-8 flex items-center gap-8 text-xs font-medium text-white/40 animate-fade-up delay-200">
          <a href="#" className="transition-colors hover:text-white">
            Privacy Policy
          </a>
          <a href="#" className="transition-colors hover:text-white">
            System Status
          </a>
          <a href="#" className="transition-colors hover:text-white">
            Support
          </a>
        </nav>
      </div>
    </main>
  );
}
