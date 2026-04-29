"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/useAuth";
import { useRouter } from "next/navigation";
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Pencil,
  X,
  Save,
} from "lucide-react";
import { TableRowSkeleton } from "@/components/ui/skeleton";

type Certificate = {
  _id: string;
  status: "pending" | "approved" | "rejected";
  issuedAt?: string;
  createdAt: string;
  userId: { _id: string; name: string; email: string };
  courseId: { _id: string; title: string };
  approvedBy?: { name: string };
  displayName?: string;
  displayCourseTitle?: string;
  displayDuration?: string;
};

function StatusBadge({ status }: { status: Certificate["status"] }) {
  const map = {
    pending: "bg-amber-500/15 text-amber-300 border-amber-400/30",
    approved: "bg-emerald-500/15 text-emerald-300 border-emerald-400/30",
    rejected: "bg-red-500/15 text-red-300 border-red-400/30",
  };
  return (
    <span
      className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border capitalize ${map[status]}`}
    >
      {status}
    </span>
  );
}

const inputCls =
  "w-full px-2.5 py-1.5 text-xs bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-slate-500 outline-none focus:border-indigo-400/50 focus:ring-1 focus:ring-indigo-500/20 transition-all";

export default function AdminCertificatesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [filter, setFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("pending");
  // Editing state: certId → { displayName, displayCourseTitle, displayDuration }
  const [editing, setEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    displayName: "",
    displayCourseTitle: "",
    displayDuration: "",
  });

  useEffect(() => {
    if (user && !["admin", "instructor"].includes(user.role))
      router.replace("/dashboard");
  }, [user, router]);

  useEffect(() => {
    fetch("/api/certificates")
      .then((r) => r.json())
      .then((data) => {
        setCerts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function startEdit(c: Certificate) {
    setEditing(c._id);
    setEditForm({
      displayName: c.displayName || c.userId?.name || "",
      displayCourseTitle: c.displayCourseTitle || c.courseId?.title || "",
      displayDuration: c.displayDuration || "",
    });
  }

  async function saveEdit(id: string) {
    setActionId(id);
    const res = await fetch(`/api/certificates/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    if (res.ok) {
      const updated = await res.json();
      setCerts((prev) =>
        prev.map((c) => (c._id === id ? { ...c, ...updated } : c)),
      );
    }
    setEditing(null);
    setActionId(null);
  }

  async function handleAction(id: string, action: "approve" | "reject") {
    setActionId(id);
    const res = await fetch(`/api/certificates/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    if (res.ok) {
      const updated = await res.json();
      setCerts((prev) =>
        prev.map((c) => (c._id === id ? { ...c, ...updated } : c)),
      );
    }
    setActionId(null);
  }

  const filtered =
    filter === "all" ? certs : certs.filter((c) => c.status === filter);
  const pendingCount = certs.filter((c) => c.status === "pending").length;

  if (!user) return null;

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Certificates
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Review, edit, and approve student certificate requests
          </p>
        </div>
        {pendingCount > 0 && (
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/15 border border-amber-400/30 rounded-xl text-xs font-semibold text-amber-300">
            <Clock className="h-3.5 w-3.5" />
            {pendingCount} pending
          </span>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(["pending", "approved", "rejected", "all"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all capitalize ${
              filter === f
                ? "bg-indigo-500/20 border-indigo-400/40 text-indigo-300"
                : "bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-white/20"
            }`}
          >
            {f}
            {f !== "all" && (
              <span className="ml-1.5 text-[10px] opacity-60">
                ({certs.filter((c) => c.status === f).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.02]">
              <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Student
              </th>
              <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Course
              </th>
              <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Requested
              </th>
              <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Status
              </th>
              <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRowSkeleton key={i} cols={5} />
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-16 text-center">
                  <Award className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">
                    {filter === "pending"
                      ? "No pending requests"
                      : `No ${filter} certificates`}
                  </p>
                </td>
              </tr>
            ) : (
              filtered.map((c) => (
                <>
                  <tr
                    key={c._id}
                    className="hover:bg-white/[0.03] transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-white">{c.userId?.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {c.userId?.email}
                      </p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-slate-300">{c.courseId?.title}</p>
                      {(c.displayName ||
                        c.displayCourseTitle ||
                        c.displayDuration) && (
                        <p className="text-[10px] text-indigo-400 mt-0.5">
                          Custom fields set
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-400">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={c.status} />
                      {c.approvedBy && (
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          by {c.approvedBy.name}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        {/* Edit button — always available */}
                        {editing !== c._id && (
                          <button
                            type="button"
                            onClick={() => startEdit(c)}
                            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all"
                            title="Edit certificate display fields"
                          >
                            <Pencil className="h-3 w-3" />
                            Edit
                          </button>
                        )}

                        {c.status === "pending" && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleAction(c._id, "approve")}
                              disabled={actionId === c._id}
                              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/30 rounded-lg transition-all disabled:opacity-50"
                            >
                              {actionId === c._id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <CheckCircle2 className="h-3 w-3" />
                              )}
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAction(c._id, "reject")}
                              disabled={actionId === c._id}
                              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-red-300 bg-red-500/15 hover:bg-red-500/25 border border-red-400/30 rounded-lg transition-all disabled:opacity-50"
                            >
                              <XCircle className="h-3 w-3" />
                              Reject
                            </button>
                          </>
                        )}

                        {c.status === "approved" && (
                          <span className="text-xs text-slate-500">
                            {c.issuedAt
                              ? new Date(c.issuedAt).toLocaleDateString()
                              : "—"}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* Inline edit row */}
                  {editing === c._id && (
                    <tr
                      key={`${c._id}-edit`}
                      className="bg-indigo-500/5 border-b border-indigo-400/20"
                    >
                      <td colSpan={5} className="px-5 py-4">
                        <div className="space-y-3">
                          <p className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">
                            Edit certificate display fields
                          </p>
                          <div className="grid sm:grid-cols-3 gap-3">
                            <div className="space-y-1">
                              <label className="text-[10px] text-slate-400">
                                Student name on certificate
                              </label>
                              <input
                                type="text"
                                value={editForm.displayName}
                                onChange={(e) =>
                                  setEditForm((p) => ({
                                    ...p,
                                    displayName: e.target.value,
                                  }))
                                }
                                placeholder={c.userId?.name}
                                className={inputCls}
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] text-slate-400">
                                Course title on certificate
                              </label>
                              <input
                                type="text"
                                value={editForm.displayCourseTitle}
                                onChange={(e) =>
                                  setEditForm((p) => ({
                                    ...p,
                                    displayCourseTitle: e.target.value,
                                  }))
                                }
                                placeholder={c.courseId?.title}
                                className={inputCls}
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] text-slate-400">
                                Duration (optional)
                              </label>
                              <input
                                type="text"
                                value={editForm.displayDuration}
                                onChange={(e) =>
                                  setEditForm((p) => ({
                                    ...p,
                                    displayDuration: e.target.value,
                                  }))
                                }
                                placeholder="e.g. 8 hours, 3 weeks"
                                className={inputCls}
                              />
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => saveEdit(c._id)}
                              disabled={actionId === c._id}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-400/30 rounded-lg transition-all disabled:opacity-50"
                            >
                              {actionId === c._id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Save className="h-3 w-3" />
                              )}
                              Save changes
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditing(null)}
                              className="flex items-center gap-1 px-3 py-1.5 text-xs text-slate-400 hover:text-white transition-colors"
                            >
                              <X className="h-3 w-3" /> Cancel
                            </button>
                            <p className="text-[10px] text-slate-500 ml-2">
                              These fields override what appears on the printed
                              certificate.
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
