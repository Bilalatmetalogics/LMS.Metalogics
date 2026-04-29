"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/useAuth";
import { useParams } from "next/navigation";
import CourseForm from "@/components/instructor/CourseForm";
import ModuleBuilder from "@/components/instructor/ModuleBuilder";
import AssignUsers from "@/components/instructor/AssignUsers";
import AnnouncementForm from "@/components/instructor/AnnouncementForm";
import Link from "next/link";
import { ChevronRight, BarChart3 } from "lucide-react";

export default function CourseEditorPage() {
  const { user } = useAuth();
  const params = useParams<{ id: string }>();
  const [course, setCourse] = useState<any>(null);
  const [assigned, setAssigned] = useState<any[]>([]);
  const [unassigned, setUnassigned] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "details" | "modules" | "assign" | "announce"
  >("details");

  useEffect(() => {
    Promise.all([
      fetch(`/api/courses/${params.id}`).then((r) => r.json()),
      fetch(`/api/courses/${params.id}/assign`).then((r) => r.json()),
    ])
      .then(([c, users]) => {
        setCourse({ ...c, modules: c.modules ?? [] });
        setAssigned(users.assigned || []);
        setUnassigned(users.unassigned || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  if (!user || !["admin", "instructor"].includes(user.role)) return null;

  if (loading)
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  if (!course) return null;

  const tabs = [
    { id: "details", label: "Details" },
    { id: "modules", label: "Modules & Content" },
    { id: "assign", label: "Assign Staff" },
    { id: "announce", label: "Announcement" },
  ] as const;

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <nav className="flex items-center gap-1.5 text-xs text-slate-400 mb-2">
            <Link
              href="/instructor/courses"
              className="hover:text-white transition-colors"
            >
              My Courses
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-white">{course.title}</span>
          </nav>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Edit Course
          </h1>
        </div>
        <Link
          href={`/instructor/grades?courseId=${params.id}`}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-300 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all"
        >
          <BarChart3 className="h-3.5 w-3.5" />
          Grade book
        </Link>
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 p-1 bg-white/5 border border-white/10 rounded-xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === tab.id
                ? "bg-indigo-500/20 border border-indigo-400/30 text-indigo-300"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
        {activeTab === "details" && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-white">Course Details</h2>
            <CourseForm course={course} />
          </div>
        )}
        {activeTab === "modules" && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-white">
              Modules & Content
            </h2>
            <ModuleBuilder course={course} />
          </div>
        )}
        {activeTab === "assign" && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-white">Assign Staff</h2>
            <AssignUsers
              courseId={params.id}
              assigned={assigned}
              unassigned={unassigned}
            />
          </div>
        )}
        {activeTab === "announce" && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-white">
              Post Announcement
            </h2>
            <AnnouncementForm courseId={params.id} />
          </div>
        )}
      </div>
    </div>
  );
}
