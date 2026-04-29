"use client";

import { useState, useMemo } from "react";
import {
  KeyRound,
  CheckCircle2,
  Loader2,
  Trash2,
  Search,
  X,
} from "lucide-react";
import { Pagination } from "@/components/ui/pagination";

type User = {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  mustChangePassword?: boolean;
};

const PAGE_SIZE = 10;

export default function UserTable({ users: initial }: { users: User[] }) {
  const [users, setUsers] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", role: "student" });
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [resettingId, setResettingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!search.trim()) return users;
    const q = search.toLowerCase();
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q),
    );
  }, [users, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function showToast(msg: string, ok = true) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 4000);
  }

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setFormError("");
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) {
      setUsers((prev) => [...prev, data]);
      setForm({ name: "", email: "", role: "student" });
      setShowForm(false);
      showToast(
        data.emailSent
          ? `Account created — login details sent to ${form.email}`
          : `Account created — email delivery failed. Check server console for credentials.`,
        data.emailSent,
      );
    } else {
      setFormError(data.error || "Failed to create user");
    }
    setLoading(false);
  }

  async function toggleActive(id: string, current: boolean) {
    await fetch(`/api/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !current }),
    });
    setUsers((prev) =>
      prev.map((u) => (u._id === id ? { ...u, isActive: !current } : u)),
    );
    showToast(current ? "User deactivated" : "User activated");
  }

  async function resetPassword(user: User) {
    if (
      !confirm(
        `Reset password for ${user.name}? A new temporary password will be emailed to them.`,
      )
    )
      return;
    setResettingId(user._id);
    const res = await fetch(`/api/users/${user._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resetPassword: true }),
    });
    const data = await res.json();
    setResettingId(null);
    showToast(
      res.ok
        ? data.emailSent
          ? `Password reset — new credentials sent to ${user.email}`
          : `Password reset — email delivery failed`
        : "Failed to reset password",
      res.ok && data.emailSent,
    );
    if (res.ok) {
      setUsers((prev) =>
        prev.map((u) =>
          u._id === user._id ? { ...u, mustChangePassword: true } : u,
        ),
      );
    }
  }

  async function hardDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await fetch(`/api/users/${deleteTarget._id}?hard=true`, {
      method: "DELETE",
    });
    setDeleting(false);
    if (res.ok) {
      setUsers((prev) => prev.filter((u) => u._id !== deleteTarget._id));
      showToast(`${deleteTarget.name} has been permanently deleted`);
    } else {
      const data = await res.json();
      showToast(data.error || "Failed to delete user", false);
    }
    setDeleteTarget(null);
    setDeleteConfirm("");
  }

  return (
    <div className="space-y-4">
      {/* Toast */}
      {toast && (
        <div
          className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium border ${
            toast.ok
              ? "bg-emerald-500/10 text-emerald-300 border-emerald-400/30"
              : "bg-red-500/10 text-red-300 border-red-400/30"
          }`}
        >
          {toast.ok ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <span>⚠️</span>
          )}
          {toast.msg}
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => {
            setShowForm(!showForm);
            setFormError("");
          }}
          className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-blue-600 text-white text-sm font-semibold rounded-xl shadow-lg transition hover:opacity-90"
        >
          {showForm ? "Cancel" : "Add user"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={createUser}
          className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4 backdrop-blur-xl"
        >
          <div>
            <p className="text-sm font-semibold text-white mb-0.5">New user</p>
            <p className="text-xs text-slate-400">
              A secure temporary password will be auto-generated and emailed.
            </p>
          </div>
          {formError && (
            <p className="text-xs text-red-300 bg-red-500/10 border border-red-400/30 rounded-lg px-3 py-2">
              {formError}
            </p>
          )}
          <div className="grid sm:grid-cols-3 gap-3">
            {(
              [
                ["name", "Full name", "text"],
                ["email", "Work email", "email"],
              ] as const
            ).map(([field, label, type]) => (
              <div key={field} className="space-y-1">
                <label
                  htmlFor={`user-${field}`}
                  className="text-xs font-medium text-slate-300"
                >
                  {label}
                </label>
                <input
                  id={`user-${field}`}
                  type={type}
                  value={(form as any)[field]}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, [field]: e.target.value }))
                  }
                  required
                  className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white outline-none focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
              </div>
            ))}
            <div className="space-y-1">
              <label
                htmlFor="user-role"
                className="text-xs font-medium text-slate-300"
              >
                Role
              </label>
              <select
                id="user-role"
                value={form.role}
                onChange={(e) =>
                  setForm((p) => ({ ...p, role: e.target.value }))
                }
                className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white outline-none focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
              >
                <option value="student" className="bg-slate-900">
                  Student
                </option>
                <option value="instructor" className="bg-slate-900">
                  Instructor
                </option>
                <option value="admin" className="bg-slate-900">
                  Admin
                </option>
              </select>
            </div>
          </div>
          <div className="flex items-center justify-between pt-1">
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5" />
              Password will be auto-generated and emailed
            </p>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-blue-600 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-all flex items-center gap-2"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {loading ? "Creating..." : "Create & send invite"}
            </button>
          </div>
        </form>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search by name, email or role…"
          className="w-full pl-10 pr-10 py-2.5 text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 outline-none focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
        />
        {search && (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setPage(1);
            }}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.02]">
              <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Name
              </th>
              <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Email
              </th>
              <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Role
              </th>
              <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Status
              </th>
              <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {paginated.map((u) => (
              <tr
                key={u._id}
                className="hover:bg-white/[0.03] transition-colors"
              >
                <td className="px-4 py-3">
                  <p className="font-medium text-white">{u.name}</p>
                  {u.mustChangePassword && (
                    <p className="text-[10px] text-amber-400 font-medium mt-0.5">
                      Awaiting first login
                    </p>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-400">{u.email}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 text-[10px] rounded-full bg-white/5 border border-white/10 text-slate-300 capitalize">
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-0.5 text-[10px] rounded-full border font-semibold ${
                      u.isActive
                        ? "bg-emerald-500/15 text-emerald-300 border-emerald-400/30"
                        : "bg-red-500/15 text-red-300 border-red-400/30"
                    }`}
                  >
                    {u.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => resetPassword(u)}
                      disabled={resettingId === u._id}
                      className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1 disabled:opacity-50"
                      title="Reset password"
                    >
                      {resettingId === u._id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <KeyRound className="w-3 h-3" />
                      )}
                      Reset pwd
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleActive(u._id, u.isActive)}
                      className="text-xs text-slate-400 hover:text-white transition-colors"
                    >
                      {u.isActive ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteTarget(u);
                        setDeleteConfirm("");
                      }}
                      className="text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {paginated.length === 0 && (
          <div className="py-12 text-center text-sm text-slate-500">
            {search ? "No users match your search" : "No users yet."}
          </div>
        )}
        {/* Pagination */}
        {filtered.length > PAGE_SIZE && (
          <div className="border-t border-white/5 px-4">
            <Pagination
              page={page}
              totalPages={totalPages}
              onPage={setPage}
              totalItems={filtered.length}
              pageSize={PAGE_SIZE}
            />
          </div>
        )}
      </div>

      {/* Delete modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-red-500/20 border border-red-400/30 rounded-xl flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  Permanently delete user?
                </p>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  This will permanently remove{" "}
                  <strong className="text-white">{deleteTarget.name}</strong>{" "}
                  from the system. Their progress, grades, and assessment
                  results will become orphaned.
                </p>
              </div>
            </div>
            <div className="bg-amber-500/10 border border-amber-400/30 rounded-lg px-3 py-2.5">
              <p className="text-xs text-amber-300">
                Consider <strong>Deactivate</strong> instead — it blocks login
                while preserving all records.
              </p>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                Type{" "}
                <span className="font-bold text-white">
                  {deleteTarget.name}
                </span>{" "}
                to confirm
              </label>
              <input
                type="text"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder={deleteTarget.name}
                className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white outline-none focus:border-red-400/50 focus:ring-2 focus:ring-red-500/20"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setDeleteTarget(null);
                  setDeleteConfirm("");
                }}
                className="flex-1 px-4 py-2 text-sm font-medium text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={hardDelete}
                disabled={deleteConfirm !== deleteTarget.name || deleting}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-40 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {deleting ? "Deleting..." : "Delete permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
