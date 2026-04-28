"use client";

import { useState } from "react";
import { KeyRound, CheckCircle2, Loader2, Trash2 } from "lucide-react";

type User = {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  mustChangePassword?: boolean;
};

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
          : `Account created — email delivery failed, check server logs`,
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
          className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${
            toast.ok
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
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
          onClick={() => {
            setShowForm(!showForm);
            setFormError("");
          }}
          className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {showForm ? "Cancel" : "Add user"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={createUser}
          className="bg-white border border-zinc-200 rounded-xl p-5 space-y-4"
        >
          <div>
            <p className="text-sm font-semibold text-zinc-900 mb-0.5">
              New user
            </p>
            <p className="text-xs text-zinc-400">
              A secure temporary password will be auto-generated and emailed to
              the user.
            </p>
          </div>
          {formError && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
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
                  className="text-xs font-medium text-zinc-600"
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
                  className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            ))}
            <div className="space-y-1">
              <label
                htmlFor="user-role"
                className="text-xs font-medium text-zinc-600"
              >
                Role
              </label>
              <select
                id="user-role"
                value={form.role}
                onChange={(e) =>
                  setForm((p) => ({ ...p, role: e.target.value }))
                }
                className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="student">Student</option>
                <option value="instructor">Instructor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <div className="flex items-center justify-between pt-1">
            <p className="text-xs text-zinc-400 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5" />
              Password will be auto-generated and emailed
            </p>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {loading ? "Creating..." : "Create & send invite"}
            </button>
          </div>
        </form>
      )}

      {/* Table */}
      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50">
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">
                Name
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">
                Email
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">
                Role
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">
                Status
              </th>
              <th className="px-4 py-3 text-xs font-medium text-zinc-500 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {users.map((u) => (
              <tr key={u._id} className="hover:bg-zinc-50 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium text-zinc-900">{u.name}</p>
                  {u.mustChangePassword && (
                    <p className="text-[10px] text-amber-600 font-medium mt-0.5">
                      Awaiting first login
                    </p>
                  )}
                </td>
                <td className="px-4 py-3 text-zinc-500">{u.email}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 text-xs rounded-full bg-zinc-100 text-zinc-600 capitalize">
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-0.5 text-xs rounded-full ${
                      u.isActive
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-red-50 text-red-600"
                    }`}
                  >
                    {u.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-3">
                    {/* Reset password */}
                    <button
                      type="button"
                      onClick={() => resetPassword(u)}
                      disabled={resettingId === u._id}
                      className="text-xs text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1 disabled:opacity-50"
                      title="Reset password and email new credentials"
                    >
                      {resettingId === u._id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <KeyRound className="w-3 h-3" />
                      )}
                      Reset pwd
                    </button>

                    {/* Deactivate / Activate */}
                    <button
                      type="button"
                      onClick={() => toggleActive(u._id, u.isActive)}
                      className="text-xs text-zinc-500 hover:text-zinc-900 transition-colors"
                      title={
                        u.isActive
                          ? "Block login, keep all data"
                          : "Re-enable login"
                      }
                    >
                      {u.isActive ? "Deactivate" : "Activate"}
                    </button>

                    {/* Hard delete */}
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteTarget(u);
                        setDeleteConfirm("");
                      }}
                      className="text-xs text-red-500 hover:text-red-700 transition-colors flex items-center gap-1"
                      title="Permanently delete user"
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
        {users.length === 0 && (
          <div className="py-12 text-center text-sm text-zinc-400">
            No users yet.
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-900">
                  Permanently delete user?
                </p>
                <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                  This will permanently remove{" "}
                  <strong>{deleteTarget.name}</strong> from the system. Their
                  progress, grades, and assessment results will become orphaned
                  and cannot be recovered.
                </p>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5">
              <p className="text-xs text-amber-800">
                Consider <strong>Deactivate</strong> instead — it blocks login
                while preserving all records.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-600">
                Type{" "}
                <span className="font-bold text-zinc-900">
                  {deleteTarget.name}
                </span>{" "}
                to confirm
              </label>
              <input
                type="text"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder={deleteTarget.name}
                className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg outline-none focus:ring-2 focus:ring-red-400"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setDeleteTarget(null);
                  setDeleteConfirm("");
                }}
                className="flex-1 px-4 py-2 text-sm font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors"
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
