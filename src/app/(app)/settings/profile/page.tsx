"use client";

import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useAuth } from "@/lib/useAuth";
import { Camera, CheckCircle2, Loader2, User } from "lucide-react";
import Image from "next/image";

export default function ProfilePage() {
  const { user } = useAuth();
  const { update: updateSession } = useSession();

  const [name, setName] = useState(user?.name || "");
  const [preview, setPreview] = useState<string | null>(
    user?.avatarUrl || null,
  );
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      let res: Response;

      if (file) {
        // Multipart upload with avatar
        const formData = new FormData();
        formData.append("name", name);
        formData.append("avatar", file);
        res = await fetch("/api/users/me", { method: "PATCH", body: formData });
      } else {
        // JSON — name only
        res = await fetch("/api/users/me", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile");

      // Update the session so TopBar reflects new name/avatar immediately
      await updateSession({ name: data.name, avatarUrl: data.avatarUrl });

      setSuccess(true);
      setFile(null);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    }

    setLoading(false);
  }

  if (!user) return null;

  const initials =
    user.name
      ?.split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() ?? "U";

  return (
    <div className="max-w-lg mx-auto text-white space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Profile
        </h1>
        <p className="text-sm text-slate-400 mt-0.5">
          Update your name and profile picture
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {success && (
            <div className="flex items-center gap-2 text-sm text-emerald-300 bg-emerald-500/10 border border-emerald-400/30 rounded-xl px-3 py-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              Profile updated successfully.
            </div>
          )}
          {error && (
            <p className="text-sm text-red-300 bg-red-500/10 border border-red-400/30 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          {/* Avatar */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative group">
              <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-white/10 bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center">
                {preview ? (
                  <Image
                    src={preview}
                    alt="Profile"
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                    unoptimized={preview.startsWith("blob:")}
                  />
                ) : (
                  <span className="text-2xl font-bold text-white">
                    {initials}
                  </span>
                )}
              </div>
              {/* Camera overlay */}
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Change profile picture"
              >
                <Camera className="h-6 w-6 text-white" />
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                {preview ? "Change photo" : "Upload photo"} (optional)
              </button>
              <p className="text-[10px] text-slate-500 mt-0.5">
                JPG, PNG or WebP · Max 5MB
              </p>
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
              aria-label="Upload profile picture"
            />
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <label
              htmlFor="profile-name"
              className="text-xs font-medium text-slate-300"
            >
              Full name
            </label>
            <input
              id="profile-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Your full name"
              className="w-full px-3 py-2.5 text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 outline-none focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
          </div>

          {/* Email — read only */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">
              Email address
            </label>
            <div className="flex items-center gap-2 px-3 py-2.5 bg-white/[0.03] border border-white/5 rounded-xl">
              <User className="h-4 w-4 text-slate-500 shrink-0" />
              <span className="text-sm text-slate-400">{user.email}</span>
              <span className="ml-auto text-[10px] text-slate-600 bg-white/5 px-2 py-0.5 rounded-full">
                Read only
              </span>
            </div>
            <p className="text-[10px] text-slate-500">
              Contact your admin to change your email address.
            </p>
          </div>

          {/* Role badge */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Role:</span>
            <span className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 capitalize">
              {user.role}
            </span>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={loading || (!file && name === user.name)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-blue-600 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all hover:opacity-90"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {loading ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
