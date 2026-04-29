"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight,
  PlayCircle,
  Link2,
  FileText,
  Youtube,
  Trash2,
  ClipboardList,
  Plus,
  Loader2,
} from "lucide-react";

type ContentType = "video" | "youtube" | "link" | "pdf";
type ContentItem = {
  _id: string;
  title: string;
  url: string;
  type: ContentType;
  duration: number;
  description?: string;
  order: number;
};
type Module = {
  _id: string;
  title: string;
  order: number;
  videos: ContentItem[];
};
type Course = { _id: string; modules: Module[] };

const TYPE_ICONS: Record<ContentType, React.ReactNode> = {
  video: <PlayCircle className="w-4 h-4 text-slate-400" />,
  youtube: <Youtube className="w-4 h-4 text-red-400" />,
  link: <Link2 className="w-4 h-4 text-blue-400" />,
  pdf: <FileText className="w-4 h-4 text-orange-400" />,
};

const TYPE_LABELS: Record<ContentType, string> = {
  video: "Video",
  youtube: "YouTube",
  link: "Link",
  pdf: "PDF",
};

const inputCls =
  "w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 outline-none focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-500/20 transition-all";

export default function ModuleBuilder({ course }: { course: Course }) {
  const params = useParams<{ id: string }>();
  const courseId = course._id || params?.id || "";
  const [modules, setModules] = useState<Module[]>(course.modules ?? []);
  const [newModTitle, setNewModTitle] = useState("");
  const [expandedMod, setExpandedMod] = useState<string | null>(null);

  async function addModule() {
    if (!newModTitle.trim()) return;
    const res = await fetch(`/api/courses/${course._id}/modules`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newModTitle }),
    });
    if (res.ok) {
      const updated = await res.json();
      setModules(updated.modules);
      setNewModTitle("");
    }
  }

  async function deleteItem(moduleId: string, videoId: string) {
    const res = await fetch(
      `/api/courses/${course._id}/modules/${moduleId}/videos`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId }),
      },
    );
    if (res.ok) {
      const updated = await res.json();
      setModules(updated.modules);
    }
  }

  return (
    <div className="space-y-3">
      {modules.map((mod) => (
        <div
          key={mod._id}
          className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl relative"
        >
          {/* Module header */}
          <button
            type="button"
            onClick={() =>
              setExpandedMod(expandedMod === mod._id ? null : mod._id)
            }
            className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-white/[0.03] transition-colors"
          >
            <div className="flex items-center gap-2">
              <ChevronRight
                className={`w-4 h-4 text-slate-500 transition-transform ${expandedMod === mod._id ? "rotate-90" : ""}`}
              />
              <span className="text-sm font-medium text-white">
                {mod.title}
              </span>
            </div>
            <span className="text-xs text-slate-500 mr-24">
              {mod.videos.length} item{mod.videos.length !== 1 ? "s" : ""}
            </span>
          </button>

          {/* Assessment link */}
          <div className="absolute right-4 top-2.5">
            <Link
              href={`/instructor/courses/${courseId}/assessment/${mod._id}`}
              className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 px-2.5 py-1.5 rounded-lg hover:bg-indigo-500/10 transition-all"
              title="Build assessment for this module"
            >
              <ClipboardList className="w-3.5 h-3.5" />
              Assessment
            </Link>
          </div>

          {/* Expanded content */}
          {expandedMod === mod._id && (
            <div className="border-t border-white/10 px-4 py-4 space-y-3">
              {mod.videos.length > 0 && (
                <ul className="space-y-2">
                  {mod.videos.map((item) => (
                    <li
                      key={item._id}
                      className="flex items-center justify-between py-2.5 px-3 bg-white/5 border border-white/10 rounded-xl"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {TYPE_ICONS[item.type || "video"]}
                        <span className="text-sm text-slate-200 truncate">
                          {item.title}
                        </span>
                        <span className="text-[10px] text-slate-500 shrink-0 px-1.5 py-0.5 bg-white/5 border border-white/10 rounded-full">
                          {TYPE_LABELS[item.type || "video"]}
                        </span>
                        {item.duration > 0 && (
                          <span className="text-xs text-slate-500 shrink-0">
                            {Math.floor(item.duration / 60)}m
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteItem(mod._id, item._id)}
                        className="text-slate-500 hover:text-red-400 transition-colors ml-2 shrink-0"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <AddContentForm
                courseId={course._id}
                moduleId={mod._id}
                onAdded={(updated) => setModules(updated.modules)}
              />
            </div>
          )}
        </div>
      ))}

      {/* Add module */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newModTitle}
          onChange={(e) => setNewModTitle(e.target.value)}
          placeholder="New module title…"
          aria-label="New module title"
          onKeyDown={(e) => e.key === "Enter" && addModule()}
          className={inputCls}
        />
        <button
          type="button"
          onClick={addModule}
          disabled={!newModTitle.trim()}
          className="flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/15 disabled:opacity-40 text-white text-sm font-medium rounded-xl border border-white/10 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </div>
    </div>
  );
}

function AddContentForm({
  courseId,
  moduleId,
  onAdded,
}: {
  courseId: string;
  moduleId: string;
  onAdded: (course: any) => void;
}) {
  const [type, setType] = useState<ContentType>("video");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  function reset() {
    setTitle("");
    setUrl("");
    setDescription("");
    setFile(null);
    setProgress(0);
    setError("");
  }

  async function getVideoDuration(src: string): Promise<number> {
    return new Promise((resolve) => {
      const v = document.createElement("video");
      v.preload = "metadata";
      v.onloadedmetadata = () => resolve(Math.round(v.duration) || 0);
      v.onerror = () => resolve(0);
      v.src = src;
    });
  }

  async function saveItem(itemUrl: string, duration = 0) {
    const res = await fetch(
      `/api/courses/${courseId}/modules/${moduleId}/videos`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          url: itemUrl,
          type,
          duration,
          description,
        }),
      },
    );
    if (res.ok) {
      onAdded(await res.json());
      reset();
    } else setError("Failed to save item");
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!title.trim()) return;
    setUploading(true);
    setError("");

    try {
      if (type === "video" && file) {
        const sigRes = await fetch("/api/upload?folder=lms/videos");
        if (!sigRes.ok) throw new Error("Could not get upload signature");
        const { signature, timestamp, cloudName, apiKey, folder } =
          await sigRes.json();
        const formData = new FormData();
        formData.append("file", file);
        formData.append("signature", signature);
        formData.append("timestamp", String(timestamp));
        formData.append("api_key", apiKey);
        formData.append("folder", folder);

        const xhr = new XMLHttpRequest();
        xhr.upload.onprogress = (ev) => {
          if (ev.lengthComputable)
            setProgress(Math.round((ev.loaded / ev.total) * 100));
        };
        const result: any = await new Promise((resolve, reject) => {
          xhr.onload = () => resolve(JSON.parse(xhr.responseText));
          xhr.onerror = reject;
          xhr.open(
            "POST",
            `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
          );
          xhr.send(formData);
        });
        if (result.error) throw new Error(result.error.message);
        await saveItem(result.secure_url, Math.round(result.duration || 0));
      } else if (type === "pdf" && file) {
        const sigRes = await fetch(
          "/api/upload?resource_type=raw&folder=lms/docs",
        );
        if (!sigRes.ok) throw new Error("Could not get upload signature");
        const { signature, timestamp, cloudName, apiKey, folder } =
          await sigRes.json();
        const formData = new FormData();
        formData.append("file", file);
        formData.append("signature", signature);
        formData.append("timestamp", String(timestamp));
        formData.append("api_key", apiKey);
        formData.append("folder", folder);

        const xhr = new XMLHttpRequest();
        xhr.upload.onprogress = (ev) => {
          if (ev.lengthComputable)
            setProgress(Math.round((ev.loaded / ev.total) * 100));
        };
        const result: any = await new Promise((resolve, reject) => {
          xhr.onload = () => resolve(JSON.parse(xhr.responseText));
          xhr.onerror = reject;
          xhr.open(
            "POST",
            `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`,
          );
          xhr.send(formData);
        });
        if (result.error) throw new Error(result.error.message);
        await saveItem(result.secure_url);
      } else {
        if (!url.trim()) throw new Error("URL is required");
        const duration = type === "video" ? await getVideoDuration(url) : 0;
        await saveItem(url, duration);
      }
    } catch (err: any) {
      setError(err.message || "Failed");
    }
    setUploading(false);
  }

  const needsFile = (type === "video" || type === "pdf") && !url.trim();
  const canSubmit =
    title.trim() && (needsFile ? !!file : url.trim()) && !uploading;

  const placeholders: Record<ContentType, string> = {
    video: "https://example.com/video.mp4",
    youtube: "https://www.youtube.com/watch?v=...",
    link: "https://example.com/article",
    pdf: "https://example.com/document.pdf",
  };

  return (
    <form
      onSubmit={submit}
      className="border border-dashed border-white/10 rounded-2xl p-4 space-y-3 bg-white/[0.02]"
    >
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
          Add Content
        </p>
        {/* Type tabs */}
        <div className="flex rounded-xl border border-white/10 overflow-hidden text-xs">
          {(["video", "youtube", "link", "pdf"] as ContentType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setType(t);
                setUrl("");
                setFile(null);
                setError("");
              }}
              className={`px-2.5 py-1.5 transition-colors border-l first:border-l-0 border-white/10 capitalize ${
                type === t
                  ? "bg-indigo-500/20 text-indigo-300"
                  : "text-slate-500 hover:text-white hover:bg-white/5"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      <div className="space-y-1.5">
        <label htmlFor={`ct-${moduleId}`} className="text-xs text-slate-400">
          Title
        </label>
        <input
          id={`ct-${moduleId}`}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Item title"
          className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 outline-none focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor={`cu-${moduleId}`} className="text-xs text-slate-400">
          {type === "video" || type === "pdf" ? "URL (or upload below)" : "URL"}
        </label>
        <input
          id={`cu-${moduleId}`}
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder={placeholders[type]}
          className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 outline-none focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
        />
      </div>

      {(type === "video" || type === "pdf") && (
        <div className="space-y-1.5">
          <label htmlFor={`cf-${moduleId}`} className="text-xs text-slate-400">
            {type === "pdf" ? "Upload PDF" : "Upload video file"}
          </label>
          <input
            id={`cf-${moduleId}`}
            type="file"
            accept={type === "pdf" ? "application/pdf" : "video/*"}
            onChange={(e) => {
              setFile(e.target.files?.[0] || null);
              setUrl("");
            }}
            className="w-full text-sm text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-indigo-500/20 file:text-indigo-300 hover:file:bg-indigo-500/30 transition-all"
          />
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor={`cd-${moduleId}`} className="text-xs text-slate-400">
          Description (optional)
        </label>
        <input
          id={`cd-${moduleId}`}
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief note for learners…"
          className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 outline-none focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
        />
      </div>

      {uploading && progress > 0 && (
        <div className="space-y-1">
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-slate-400">{progress}%</p>
        </div>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        className="flex items-center gap-2 px-4 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 disabled:opacity-40 text-indigo-300 text-xs font-semibold rounded-xl border border-indigo-400/30 transition-all"
      >
        {uploading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Plus className="w-3.5 h-3.5" />
        )}
        {uploading ? "Processing…" : "Add item"}
      </button>
    </form>
  );
}
