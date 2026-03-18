"use client";

import { useState, useRef } from "react";

export default function VideoUploader({
  courseId,
  moduleId,
  onUploaded,
}: {
  courseId: string;
  moduleId: string;
  onUploaded: (course: any) => void;
}) {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleUpload() {
    if (!title.trim() || !file) return;
    setUploading(true);
    setError("");
    setProgress(0);

    try {
      // 1. Get signed upload params
      const sigRes = await fetch("/api/upload?folder=lms/videos");
      const { signature, timestamp, cloudName, apiKey, folder } =
        await sigRes.json();

      // 2. Upload directly to Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("signature", signature);
      formData.append("timestamp", timestamp);
      formData.append("api_key", apiKey);
      formData.append("folder", folder);
      formData.append("resource_type", "video");

      const xhr = new XMLHttpRequest();
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable)
          setProgress(Math.round((e.loaded / e.total) * 100));
      };

      const uploadResult: any = await new Promise((resolve, reject) => {
        xhr.onload = () => resolve(JSON.parse(xhr.responseText));
        xhr.onerror = reject;
        xhr.open(
          "POST",
          `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
        );
        xhr.send(formData);
      });

      if (uploadResult.error) throw new Error(uploadResult.error.message);

      // 3. Save video to course
      const res = await fetch(
        `/api/courses/${courseId}/modules/${moduleId}/videos`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            url: uploadResult.secure_url,
            duration: Math.round(uploadResult.duration || 0),
            thumbnailUrl: uploadResult.secure_url
              .replace("/upload/", "/upload/so_0/")
              .replace(/\.\w+$/, ".jpg"),
          }),
        },
      );

      if (res.ok) {
        const updated = await res.json();
        onUploaded(updated);
        setTitle("");
        setFile(null);
        setProgress(0);
        if (inputRef.current) inputRef.current.value = "";
      }
    } catch (err: any) {
      setError(err.message || "Upload failed");
    }
    setUploading(false);
  }

  return (
    <div className="border border-dashed border-zinc-200 rounded-lg p-4 space-y-3">
      <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
        Add Video
      </p>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label
            htmlFor={`video-title-${moduleId}`}
            className="text-xs text-zinc-500"
          >
            Video title
          </label>
          <input
            id={`video-title-${moduleId}`}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Introduction to Safety"
            className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="space-y-1">
          <label
            htmlFor={`video-file-${moduleId}`}
            className="text-xs text-zinc-500"
          >
            Video file
          </label>
          <input
            id={`video-file-${moduleId}`}
            ref={inputRef}
            type="file"
            accept="video/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full text-sm text-zinc-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-zinc-100 file:text-zinc-700 hover:file:bg-zinc-200"
          />
        </div>
      </div>

      {uploading && (
        <div className="space-y-1">
          <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-zinc-400">{progress}% uploaded</p>
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={uploading || !title.trim() || !file}
        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-medium rounded-lg transition-colors"
      >
        {uploading ? "Uploading..." : "Upload video"}
      </button>
    </div>
  );
}
