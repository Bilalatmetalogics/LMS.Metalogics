import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Users,
  BookOpen,
  Award,
  BarChart3,
} from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "AI-assisted learning",
    body: "Smart summaries, MCQ generation and tutoring built into every course.",
  },
  {
    icon: ShieldCheck,
    title: "Role-aware access",
    body: "Admins, instructors and students get exactly the tools they need.",
  },
  {
    icon: Users,
    title: "Team-first",
    body: "Track cohorts, certifications and progress across the whole org.",
  },
];

const stats = [
  { icon: BookOpen, label: "Courses", value: "Unlimited" },
  { icon: Users, label: "Learners", value: "Any scale" },
  { icon: Award, label: "Assessments", value: "Auto-graded" },
  { icon: BarChart3, label: "Analytics", value: "Real-time" },
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--sidebar)] text-white">
      {/* Mesh gradient */}
      <div className="bg-gradient-mesh animate-mesh pointer-events-none absolute inset-0 opacity-90" />
      {/* Animated grid */}
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-20" />
      {/* Vignette */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_40%,oklch(0.1_0.04_265/0.7)_100%)]" />
      {/* Blobs */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-[480px] w-[480px] rounded-full bg-indigo-500/15 blur-3xl animate-blob" />
      <div className="pointer-events-none absolute top-1/2 -right-40 h-[520px] w-[520px] rounded-full bg-violet-500/10 blur-3xl animate-blob animation-delay-2000" />

      <div className="relative z-10">
        {/* ── Header ── */}
        <header className="flex items-center justify-between px-6 py-5 sm:px-10">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-glow overflow-hidden">
              <Image
                src="/METALOGICS-White.png"
                alt="MetaLogics"
                width={28}
                height={28}
                className="object-contain"
              />
            </span>
            <span className="text-base font-semibold tracking-tight">
              MetaLogics <span className="text-white/50">LMS</span>
            </span>
          </div>

          <nav className="flex items-center gap-2">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all"
            >
              Sign in
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-gradient-primary rounded-xl shadow-glow hover:opacity-90 transition-all"
            >
              Get started <ArrowRight className="h-4 w-4" />
            </Link>
          </nav>
        </header>

        <main className="px-6 sm:px-10">
          {/* ── Hero ── */}
          <section className="mx-auto max-w-4xl py-20 text-center sm:py-28">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs uppercase tracking-wider text-white/60">
              <Sparkles className="h-3 w-3 text-indigo-300" />
              Internal Training Platform
            </span>

            <h1 className="mt-6 text-5xl font-bold tracking-tight sm:text-7xl leading-tight">
              Learn. <span className="text-gradient-primary">Build.</span> Ship.
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base text-white/60 sm:text-lg leading-relaxed">
              The MetaLogics internal learning platform — role-aware courses,
              auto-graded assessments, and real-time progress tracking for your
              entire team.
            </p>

            <div className="mt-10 flex items-center justify-center gap-3 flex-wrap">
              <Link
                href="/login"
                className="flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-gradient-primary rounded-xl shadow-glow hover:opacity-90 hover:-translate-y-0.5 transition-all"
              >
                Sign in to your account <ArrowRight className="h-4 w-4" />
              </Link>
              <p className="text-xs text-white/40 w-full mt-1">
                Accounts are created by your administrator
              </p>
            </div>
          </section>

          {/* ── Stats strip ── */}
          <section className="mx-auto max-w-4xl mb-16">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {stats.map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="glass-panel rounded-2xl p-5 text-center"
                >
                  <Icon className="h-5 w-5 text-indigo-300 mx-auto mb-2" />
                  <div className="text-lg font-bold text-white">{value}</div>
                  <div className="text-xs text-white/50 mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Feature cards ── */}
          <section className="mx-auto grid max-w-5xl gap-4 pb-24 sm:grid-cols-3">
            {features.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="glass-panel rounded-2xl p-6 group hover:border-indigo-400/30 transition-all hover:-translate-y-0.5"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 border border-indigo-400/20 mb-4">
                  <Icon className="h-5 w-5 text-indigo-300" />
                </div>
                <h3 className="text-base font-semibold text-white">{title}</h3>
                <p className="mt-2 text-sm text-white/60 leading-relaxed">
                  {body}
                </p>
              </div>
            ))}
          </section>
        </main>

        {/* ── Footer ── */}
        <footer className="border-t border-white/5 px-6 py-6 sm:px-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/30">
            <span>
              © {new Date().getFullYear()} MetaLogics. All rights reserved.
            </span>
            <div className="flex gap-6">
              <span className="hover:text-white/60 cursor-pointer transition-colors">
                Privacy Policy
              </span>
              <span className="hover:text-white/60 cursor-pointer transition-colors">
                System Status
              </span>
              <span className="hover:text-white/60 cursor-pointer transition-colors">
                Support
              </span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
