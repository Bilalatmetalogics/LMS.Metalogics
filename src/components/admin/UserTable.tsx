"use client";

import { useState } from "react";

type User = {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
};

export default function UserTable({ users: initial }: { users: User[] }) {
  const [users, setUsers] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });
  const [loading, setLoading] = useState(false);

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const user = await res.json();
      setUsers((prev) => [...prev, user]);
      setForm({ name: "", email: "", password: "", role: "student" });
      setShowForm(false);
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
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {showForm ? "Cancel" : "Add user"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={createUser}
          className="bg-white border border-zinc-200 rounded-xl p-4 grid sm:grid-cols-2 gap-3"
        >
          {[
            ["name", "Full name", "text"],
            ["email", "Email", "email"],
            ["password", "Password", "password"],
          ].map(([field, label, type]) => (
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
              onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="student">Student</option>
              <option value="instructor">Instructor</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="sm:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {loading ? "Creating..." : "Create user"}
            </button>
          </div>
        </form>
      )}

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
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {users.map((u) => (
              <tr key={u._id} className="hover:bg-zinc-50 transition-colors">
                <td className="px-4 py-3 font-medium text-zinc-900">
                  {u.name}
                </td>
                <td className="px-4 py-3 text-zinc-500">{u.email}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 text-xs rounded-full bg-zinc-100 text-zinc-600 capitalize">
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-0.5 text-xs rounded-full ${u.isActive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}
                  >
                    {u.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => toggleActive(u._id, u.isActive)}
                    className="text-xs text-zinc-500 hover:text-zinc-900 transition-colors"
                  >
                    {u.isActive ? "Deactivate" : "Activate"}
                  </button>
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
    </div>
  );
}
