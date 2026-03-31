"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

const DEMO_ACCOUNTS = [
  {
    role: "Admin Portal",
    email: "admin@company.com",
    password: "Admin@123",
    icon: "shield_person",
    color: "text-[#3525cd] bg-[#e2dfff]",
    hoverIcon: "text-[#3525cd]",
  },
  {
    role: "Instructor View",
    email: "instructor@company.com",
    password: "Instructor@123",
    icon: "school",
    color: "text-[#7e3000] bg-[#ffdbcc]",
    hoverIcon: "text-[#7e3000]",
  },
  {
    role: "Learner Access",
    email: "student@company.com",
    password: "Student@123",
    icon: "person",
    color: "text-[#58579b] bg-[#e2dfff]",
    hoverIcon: "text-[#58579b]",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
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
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#f4f2fd] antialiased relative overflow-hidden">
      {/* Ambient blobs */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#3525cd]/5 blur-[120px] rounded-full -z-10" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#7e3000]/5 blur-[120px] rounded-full -z-10" />

      <main className="w-full max-w-[440px] flex flex-col gap-8">
        {/* Auth card */}
        <section className="bg-white rounded-xl p-10 shadow-[0_32px_64px_-12px_rgba(53,37,205,0.08)] border border-[#c7c4d8]/15">
          {/* Header */}
          <header className="flex flex-col items-center text-center mb-10">
            <div className="mb-6 w-16 h-16 rounded-2xl bg-[#e8e7f1] flex items-center justify-center overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/METALOGICS-SVG-02.png"
                alt="MetaLogics"
                className="w-12 h-12 object-contain"
                onError={(e) => {
                  const el = e.target as HTMLImageElement;
                  el.style.display = "none";
                  el.parentElement!.innerHTML =
                    '<span class="material-symbols-outlined text-[#3525cd] text-3xl">school</span>';
                }}
              />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#1a1b22] mb-2">
              Internal Training
            </h1>
            <p className="text-[#464555] text-sm font-medium">
              Sign in to your account
            </p>
          </header>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 bg-[#ffdad6]/50 border border-[#ba1a1a]/20 rounded-lg flex items-center gap-3">
              <span className="material-symbols-outlined text-[#ba1a1a] text-[20px]">
                report
              </span>
              <p className="text-[#93000a] text-xs font-semibold">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="text-[10px] font-black uppercase tracking-widest text-[#464555] ml-1"
              >
                Email Address
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#777587] text-[20px] transition-colors group-focus-within:text-[#3525cd]">
                  mail
                </span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@company.com"
                  className="w-full pl-12 pr-4 py-3.5 bg-[#f4f2fd] border border-[#c7c4d8]/40 rounded-lg text-sm font-medium text-[#1a1b22] placeholder:text-[#777587]/60 focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/20 focus:border-[#3525cd] transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center ml-1">
                <label
                  htmlFor="password"
                  className="text-[10px] font-black uppercase tracking-widest text-[#464555]"
                >
                  Password
                </label>
              </div>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#777587] text-[20px] transition-colors group-focus-within:text-[#3525cd]">
                  lock
                </span>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3.5 bg-[#f4f2fd] border border-[#c7c4d8]/40 rounded-lg text-sm font-medium text-[#1a1b22] placeholder:text-[#777587]/60 focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/20 focus:border-[#3525cd] transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 signature-gradient text-white rounded-lg font-bold text-sm shadow-lg shadow-[#4f46e5]/25 hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
              {!loading && (
                <span className="material-symbols-outlined text-[18px]">
                  arrow_forward
                </span>
              )}
            </button>
          </form>
        </section>

        {/* Demo accounts */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-4 px-2">
            <div className="h-px flex-1 bg-[#c7c4d8]/30" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#777587]">
              Quick Access (Demo)
            </span>
            <div className="h-px flex-1 bg-[#c7c4d8]/30" />
          </div>

          <div className="flex flex-col gap-2">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.email}
                type="button"
                onClick={() => {
                  setEmail(acc.email);
                  setPassword(acc.password);
                }}
                className="group flex items-center justify-between p-4 bg-white/40 hover:bg-white border border-[#c7c4d8]/10 rounded-xl transition-all hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${acc.color}`}
                  >
                    <span
                      className="material-symbols-outlined text-[20px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {acc.icon}
                    </span>
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-[#1a1b22]">
                      {acc.role}
                    </p>
                    <p className="text-[11px] text-[#464555] font-medium">
                      {acc.email}
                    </p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[#777587] group-hover:text-[#3525cd] transition-colors text-[20px]">
                  login
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="flex justify-center gap-6">
          <span className="text-[11px] font-semibold text-[#777587]">
            Privacy Policy
          </span>
          <span className="text-[11px] font-semibold text-[#777587]">
            System Status
          </span>
          <span className="text-[11px] font-semibold text-[#777587]">
            Support
          </span>
        </footer>
      </main>
    </div>
  );
}
