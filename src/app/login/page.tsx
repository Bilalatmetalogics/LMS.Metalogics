"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { GraduationCap } from "lucide-react";

export default function LoginPage() {
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
      // Hard redirect — ensures session cookie is picked up before rendering
      window.location.href = "/dashboard";
    } else {
      setError("Invalid email or password");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-indigo-600 mb-4">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-semibold text-zinc-900">
            Internal Training
          </h1>
          <p className="text-sm text-zinc-500 mt-1">Sign in to your account</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm space-y-4"
        >
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </div>
          )}
          <div className="space-y-1">
            <label
              className="text-sm font-medium text-zinc-700"
              htmlFor="email"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="you@company.com"
            />
          </div>
          <div className="space-y-1">
            <label
              className="text-sm font-medium text-zinc-700"
              htmlFor="password"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="mt-4 bg-white border border-zinc-200 rounded-xl p-4 space-y-1">
          <p className="text-xs font-semibold text-zinc-500 mb-2">
            Demo accounts
          </p>
          {[
            ["admin@company.com", "Admin@123", "Admin"],
            ["instructor@company.com", "Instructor@123", "Instructor"],
            ["student@company.com", "Student@123", "Student"],
          ].map(([e, p, role]) => (
            <button
              key={e}
              type="button"
              onClick={() => {
                setEmail(e);
                setPassword(p);
              }}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-zinc-50 transition-colors"
            >
              <span className="text-xs font-medium text-zinc-700">{role}</span>
              <span className="text-xs text-zinc-400 ml-2">{e}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
