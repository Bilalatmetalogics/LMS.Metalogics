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
  video: <PlayCircle className="w-4 h-4 text-zinc-400" />,
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
          className="bg-white border border-zinc-200 rounded-xl overflow-hidden relative"
        >
          <button
            type="button"
            onClick={() =>
              setExpandedMod(expandedMod === mod._id ? null : mod._id)
            }
            className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-zinc-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <ChevronRight
                className={`w-4 h-4 text-zinc-400 transition-transform ${expandedMod === mod._id ? "rotate-90" : ""}`}
              />
              <span className="text-sm font-medium text-zinc-900">
                {mod.title}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-zinc-400">
                {mod.videos.length} item{mod.videos.length !== 1 ? "s" : ""}
              </span>
            </div>
          </button>
          {/* Assessment builder link — outside the toggle button */}
          <div className="absolute right-12 top-2.5">
            <Link
              href={`/instructor/courses/${courseId}/assessment/${mod._id}`}
              className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 px-2 py-1 rounded hover:bg-indigo-50 transition-colors"
              title="Build assessment for this module"
            >
              <ClipboardList className="w-3.5 h-3.5" />
              Assessment
            </Link>
          </div>

          {expandedMod === mod._id && (
            <div className="border-t border-zinc-100 px-4 py-3 space-y-3">
              {mod.videos.length > 0 && (
                <ul className="space-y-2">
                  {mod.videos.map((item) => (
                    <li
                      key={item._id}
                      className="flex items-center justify-between py-2 px-3 bg-zinc-50 rounded-lg"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {TYPE_ICONS[item.type || "video"]}
                        <span className="text-sm text-zinc-700 truncate">
                          {item.title}
                        </span>
                        <span className="text-xs text-zinc-400 shrink-0 px-1.5 py-0.5 bg-zinc-100 rounded">
                          {TYPE_LABELS[item.type || "video"]}
                        </span>
                        {item.duration > 0 && (
                          <span className="text-xs text-zinc-400 shrink-0">
                            {Math.floor(item.duration / 60)}m
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteItem(mod._id, item._id)}
                        className="text-zinc-400 hover:text-red-500 transition-colors ml-2 shrink-0"
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

      <div className="flex gap-2">
        <input
          type="text"
          value={newModTitle}
          onChange={(e) => setNewModTitle(e.target.value)}
          placeholder="New module title..."
          aria-label="New module title"
          onKeyDown={(e) => e.key === "Enter" && addModule()}
          className="flex-1 px-3 py-2 text-sm border border-zinc-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="button"
          onClick={addModule}
          disabled={!newModTitle.trim()}
          className="px-3 py-2 bg-zinc-900 hover:bg-zinc-700 disabled:opacity-40 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Add module
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
    } else {
      setError("Failed to save item");
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setUploading(true);
    setError("");

    try {
      if (type === "video" && file) {
        // Cloudinary upload
        const sigRes = await fetch("/api/upload?folder=lms/videos");
        if (!sigRes.ok) throw new Error("Could not get upload signature");
        const { signature, timestamp, cloudName, apiKey, folder } =
          await sigRes.json();

        const formData = new FormData();
        formData.append("file", file);
        formData.append("signature", signature);
        formData.append("timestamp", timestamp);
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
        // Cloudinary raw upload for PDF
        const sigRes = await fetch(
          "/api/upload?resource_type=raw&folder=lms/docs",
        );
        if (!sigRes.ok) throw new Error("Could not get upload signature");
        const { signature, timestamp, cloudName, apiKey, folder } =
          await sigRes.json();

        const formData = new FormData();
        formData.append("file", file);
        formData.append("signature", signature);
        formData.append("timestamp", timestamp);
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
        // URL-based: video url, youtube, link, or pdf url
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
      className="border border-dashed border-zinc-200 rounded-lg p-3 space-y-3"
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
          Add Content
        </p>
        {/* Type selector */}
        <div className="flex rounded-md border border-zinc-200 overflow-hidden text-xs">
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
              className={`px-2.5 py-1 transition-colors border-l first:border-l-0 border-zinc-200 capitalize ${
                type === t
                  ? "bg-zinc-900 text-white"
                  : "text-zinc-500 hover:bg-zinc-50"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      {/* Title */}
      <div className="space-y-1">
        <label htmlFor={`ct-${moduleId}`} className="text-xs text-zinc-500">
          Title
        </label>
        <input
          id={`ct-${moduleId}`}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Item title"
          className="w-full px-3 py-1.5 text-sm border border-zinc-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* URL input — always shown for youtube/link, optional for video/pdf */}
      <div className="space-y-1">
        <label htmlFor={`cu-${moduleId}`} className="text-xs text-zinc-500">
          {type === "video" || type === "pdf" ? "URL (or upload below)" : "URL"}
        </label>
        <input
          id={`cu-${moduleId}`}
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder={placeholders[type]}
          className="w-full px-3 py-1.5 text-sm border border-zinc-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* File upload — only for video and pdf */}
      {(type === "video" || type === "pdf") && (
        <div className="space-y-1">
          <label htmlFor={`cf-${moduleId}`} className="text-xs text-zinc-500">
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
            className="w-full text-sm text-zinc-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-zinc-100 file:text-zinc-700 hover:file:bg-zinc-200"
          />
        </div>
      )}

      {/* Optional description */}
      <div className="space-y-1">
        <label htmlFor={`cd-${moduleId}`} className="text-xs text-zinc-500">
          Description (optional)
        </label>
        <input
          id={`cd-${moduleId}`}
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief note for learners..."
          className="w-full px-3 py-1.5 text-sm border border-zinc-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Upload progress */}
      {uploading && progress > 0 && (
        <div className="space-y-1">
          <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-zinc-400">{progress}%</p>
        </div>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-medium rounded-lg transition-colors"
      >
        {uploading ? "Processing..." : "Add item"}
      </button>
    </form>
  );
}
