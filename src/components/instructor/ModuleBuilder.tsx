"use client";

import { useState } from "react";
import { ChevronRight, PlayCircle, Trash2, Upload } from "lucide-react";

type Video = {
  _id: string;
  title: string;
  url: string;
  duration: number;
  order: number;
};
type Module = { _id: string; title: string; order: number; videos: Video[] };
type Course = { _id: string; modules: Module[] };

export default function ModuleBuilder({ course }: { course: Course }) {
  const [modules, setModules] = useState<Module[]>(course.modules);
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

  async function deleteVideo(moduleId: string, videoId: string) {
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

  function onVideoAdded(updatedCourse: any) {
    setModules(updatedCourse.modules);
  }

  return (
    <div className="space-y-3">
      {modules.map((mod) => (
        <div
          key={mod._id}
          className="bg-white border border-zinc-200 rounded-xl overflow-hidden"
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
            <span className="text-xs text-zinc-400">
              {mod.videos.length} video{mod.videos.length !== 1 ? "s" : ""}
            </span>
          </button>

          {expandedMod === mod._id && (
            <div className="border-t border-zinc-100 px-4 py-3 space-y-3">
              {mod.videos.length > 0 && (
                <ul className="space-y-2">
                  {mod.videos.map((v) => (
                    <li
                      key={v._id}
                      className="flex items-center justify-between py-2 px-3 bg-zinc-50 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <PlayCircle className="w-4 h-4 text-zinc-400" />
                        <span className="text-sm text-zinc-700">{v.title}</span>
                        {v.duration > 0 && (
                          <span className="text-xs text-zinc-400">
                            {Math.floor(v.duration / 60)}m
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteVideo(mod._id, v._id)}
                        className="text-zinc-400 hover:text-red-500 transition-colors"
                        aria-label="Remove video"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <AddVideoForm
                courseId={course._id}
                moduleId={mod._id}
                onAdded={onVideoAdded}
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

function AddVideoForm({
  courseId,
  moduleId,
  onAdded,
}: {
  courseId: string;
  moduleId: string;
  onAdded: (course: any) => void;
}) {
  const [tab, setTab] = useState<"url" | "file">("url");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  function reset() {
    setTitle("");
    setUrl("");
    setFile(null);
    setProgress(0);
    setError("");
  }

  async function getDuration(src: string): Promise<number> {
    return new Promise((resolve) => {
      const v = document.createElement("video");
      v.preload = "metadata";
      v.onloadedmetadata = () => resolve(Math.round(v.duration) || 0);
      v.onerror = () => resolve(0);
      v.src = src;
    });
  }

  async function saveVideo(videoUrl: string, duration: number) {
    const res = await fetch(
      `/api/courses/${courseId}/modules/${moduleId}/videos`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, url: videoUrl, duration }),
      },
    );
    if (res.ok) {
      onAdded(await res.json());
      reset();
    } else {
      setError("Failed to save video");
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setUploading(true);
    setError("");

    if (tab === "url") {
      if (!url.trim()) {
        setUploading(false);
        return;
      }
      const duration = await getDuration(url);
      await saveVideo(url, duration);
    } else {
      if (!file) {
        setUploading(false);
        return;
      }
      try {
        // Get signed upload params from Cloudinary
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
        await saveVideo(result.secure_url, Math.round(result.duration || 0));
      } catch (err: any) {
        setError(err.message || "Upload failed");
      }
    }
    setUploading(false);
  }

  const canSubmit =
    title.trim() && (tab === "url" ? url.trim() : !!file) && !uploading;

  return (
    <form
      onSubmit={submit}
      className="border border-dashed border-zinc-200 rounded-lg p-3 space-y-3"
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
          Add Video
        </p>
        <div className="flex rounded-md border border-zinc-200 overflow-hidden text-xs">
          <button
            type="button"
            onClick={() => setTab("url")}
            className={`px-2.5 py-1 transition-colors ${tab === "url" ? "bg-zinc-900 text-white" : "text-zinc-500 hover:bg-zinc-50"}`}
          >
            Paste URL
          </button>
          <button
            type="button"
            onClick={() => setTab("file")}
            className={`px-2.5 py-1 transition-colors border-l border-zinc-200 ${tab === "file" ? "bg-zinc-900 text-white" : "text-zinc-500 hover:bg-zinc-50"}`}
          >
            Upload file
          </button>
        </div>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="space-y-1">
        <label htmlFor={`vt-${moduleId}`} className="text-xs text-zinc-500">
          Title
        </label>
        <input
          id={`vt-${moduleId}`}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Video title"
          className="w-full px-3 py-1.5 text-sm border border-zinc-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      {tab === "url" ? (
        <div className="space-y-1">
          <label htmlFor={`vu-${moduleId}`} className="text-xs text-zinc-500">
            Video URL
          </label>
          <input
            id={`vu-${moduleId}`}
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/video.mp4"
            className="w-full px-3 py-1.5 text-sm border border-zinc-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      ) : (
        <div className="space-y-1">
          <label htmlFor={`vf-${moduleId}`} className="text-xs text-zinc-500">
            Video file
          </label>
          <input
            id={`vf-${moduleId}`}
            type="file"
            accept="video/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full text-sm text-zinc-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-zinc-100 file:text-zinc-700 hover:file:bg-zinc-200"
          />
        </div>
      )}
      {uploading && (
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
        {uploading ? "Processing..." : "Add video"}
      </button>
    </form>
  );
}
