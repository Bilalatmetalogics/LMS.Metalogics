"use client";

import { useAuth } from "@/lib/useAuth";
import { db } from "@/lib/mockStore";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { UserPlus } from "lucide-react";

export default function AdminUsersPage() {
  const { user } = useAuth();
  const router = useRouter();
  if (!user || user.role !== "admin") {
    router.replace("/dashboard");
    return null;
  }

  const [users, setUsers] = useState(() => db.users.getAll());
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });

  function refresh() {
    setUsers(db.users.getAll());
  }

  function createUser(e: React.FormEvent) {
    e.preventDefault();
    db.users.upsert({
      id: crypto.randomUUID(),
      ...form,
      role: form.role as any,
      assignedCourses: [],
      isActive: true,
    });
    setForm({ name: "", email: "", password: "", role: "student" });
    setShowForm(false);
    refresh();
  }

  function toggleActive(id: string, current: boolean) {
    const u = db.users.findById(id);
    if (u) {
      db.users.upsert({ ...u, isActive: !current });
      refresh();
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900">Users</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Manage staff accounts</p>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <UserPlus className="w-3.5 h-3.5" />
          {showForm ? "Cancel" : "Add user"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={createUser}
          className="bg-white border border-zinc-200 rounded-xl p-4 grid sm:grid-cols-2 gap-3"
        >
          {(["name", "email", "password"] as const).map((field) => (
            <div key={field} className="space-y-1">
              <label
                htmlFor={`u-${field}`}
                className="text-xs font-medium text-zinc-600 capitalize"
              >
                {field}
              </label>
              <input
                id={`u-${field}`}
                type={
                  field === "password"
                    ? "password"
                    : field === "email"
                      ? "email"
                      : "text"
                }
                value={form[field]}
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
              htmlFor="u-role"
              className="text-xs font-medium text-zinc-600"
            >
              Role
            </label>
            <select
              id="u-role"
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
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Create user
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
              <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-zinc-50 transition-colors">
                <td className="px-4 py-3 font-medium text-zinc-900">
                  {u.name}
                </td>
                <td className="px-4 py-3 text-zinc-500">{u.email}</td>
                <td className="px-4 py-3">
                  <Badge>{u.role}</Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={u.isActive ? "success" : "danger"}>
                    {u.isActive ? "Active" : "Inactive"}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => toggleActive(u.id, u.isActive)}
                    className="text-xs text-zinc-500 hover:text-zinc-900 transition-colors"
                  >
                    {u.isActive ? "Deactivate" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
