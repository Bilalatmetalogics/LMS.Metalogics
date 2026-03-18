"use client";

import { useState, useRef } from "react";
import { db, MockCourse, MockVideo } from "@/lib/mockStore";
import { ChevronRight, PlayCircle, Trash2, Upload } from "lucide-react";

export default function ModuleBuilder({ course }: { course: MockCourse }) {
  const [modules, setModules] = useState(course.modules);
  const [newModTitle, setNewModTitle] = useState("");
  const [expandedMod, setExpandedMod] = useState<string | null>(null);

  function refresh() {
    const updated = db.courses.findById(course.id);
    if (updated) setModules(updated.modules);
  }

  function addModule() {
    if (!newModTitle.trim()) return;
    const updated = db.courses.findById(course.id)!;
    updated.modules.push({
      id: crypto.randomUUID(),
      title: newModTitle,
      order: updated.modules.length + 1,
      videos: [],
    });
    db.courses.upsert(updated);
    setNewModTitle("");
    refresh();
  }

  function addVideo(moduleId: string, video: Omit<MockVideo, "id" | "order">) {
    const updated = db.courses.findById(course.id)!;
    const mod = updated.modules.find((m) => m.id === moduleId);
    if (!mod) return;
    mod.videos.push({
      id: crypto.randomUUID(),
      order: mod.videos.length + 1,
      ...video,
    });
    db.courses.upsert(updated);
    refresh();
  }

  function deleteVideo(moduleId: string, videoId: string) {
    const updated = db.courses.findById(course.id)!;
    const mod = updated.modules.find((m) => m.id === moduleId);
    if (!mod) return;
    mod.videos = mod.videos.filter((v) => v.id !== videoId);
    db.courses.upsert(updated);
    refresh();
  }

  return (
    <div className="space-y-3">
      {modules.map((mod) => (
        <div
          key={mod.id}
          className="bg-white border border-zinc-200 rounded-xl overflow-hidden"
        >
          <button
            type="button"
            onClick={() =>
              setExpandedMod(expandedMod === mod.id ? null : mod.id)
            }
            className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-zinc-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <ChevronRight
                className={`w-4 h-4 text-zinc-400 transition-transform ${expandedMod === mod.id ? "rotate-90" : ""}`}
              />
              <span className="text-sm font-medium text-zinc-900">
                {mod.title}
              </span>
            </div>
            <span className="text-xs text-zinc-400">
              {mod.videos.length} video{mod.videos.length !== 1 ? "s" : ""}
            </span>
          </button>

          {expandedMod === mod.id && (
            <div className="border-t border-zinc-100 px-4 py-3 space-y-3">
              {mod.videos.length > 0 && (
                <ul className="space-y-2">
                  {mod.videos.map((v) => (
                    <li
                      key={v.id}
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
                        onClick={() => deleteVideo(mod.id, v.id)}
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
                moduleId={mod.id}
                onAdd={(v) => addVideo(mod.id, v)}
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
  moduleId,
  onAdd,
}: {
  moduleId: string;
  onAdd: (v: Omit<MockVideo, "id" | "order">) => void;
}) {
  const [tab, setTab] = useState<"url" | "file">("url");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  function reset() {
    setTitle("");
    setUrl("");
    setFile(null);
    setProgress(0);
    if (fileRef.current) fileRef.current.value = "";
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

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    if (tab === "url") {
      if (!url.trim()) return;
      const duration = await getDuration(url);
      onAdd({ title, url, duration });
      reset();
      return;
    }

    // file tab — create a blob URL
    if (!file) return;
    setUploading(true);

    // Simulate progress for UX
    let p = 0;
    const interval = setInterval(() => {
      p = Math.min(p + 20, 90);
      setProgress(p);
    }, 80);

    const blobUrl = URL.createObjectURL(file);
    const duration = await getDuration(blobUrl);

    clearInterval(interval);
    setProgress(100);

    setTimeout(() => {
      onAdd({ title, url: blobUrl, duration });
      reset();
      setUploading(false);
    }, 300);
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
          <div
            className="relative border border-zinc-200 rounded-lg overflow-hidden cursor-pointer hover:border-indigo-300 transition-colors"
            onClick={() => fileRef.current?.click()}
          >
            <input
              id={`vf-${moduleId}`}
              ref={fileRef}
              type="file"
              accept="video/*"
              className="sr-only"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <div className="flex items-center gap-3 px-3 py-2.5">
              <Upload className="w-4 h-4 text-zinc-400 shrink-0" />
              <span className="text-sm text-zinc-500 truncate">
                {file ? file.name : "Click to choose a video file"}
              </span>
              {file && (
                <span className="text-xs text-zinc-400 ml-auto shrink-0">
                  {(file.size / 1024 / 1024).toFixed(1)} MB
                </span>
              )}
            </div>
          </div>
          <p className="text-xs text-zinc-400">
            Stored as a local blob URL — works for demo/testing only.
          </p>
        </div>
      )}

      {uploading && (
        <div className="space-y-1">
          <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-150"
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
