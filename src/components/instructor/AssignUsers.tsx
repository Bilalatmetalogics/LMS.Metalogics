"use client";

import { useState } from "react";

type User = { _id: string; name: string; email: string };

export default function AssignUsers({
  courseId,
  assigned: init_a,
  unassigned: init_u,
}: {
  courseId: string;
  assigned: User[];
  unassigned: User[];
}) {
  const [assigned, setAssigned] = useState(init_a);
  const [unassigned, setUnassigned] = useState(init_u);

  async function toggle(user: User, action: "assign" | "unassign") {
    await fetch(`/api/courses/${courseId}/assign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userIds: [user._id], action }),
    });

    if (action === "assign") {
      setAssigned((p) => [...p, user]);
      setUnassigned((p) => p.filter((x) => x._id !== user._id));
    } else {
      setUnassigned((p) => [...p, user]);
      setAssigned((p) => p.filter((x) => x._id !== user._id));
    }
  }

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
        <div className="px-4 py-2.5 border-b border-zinc-100 bg-zinc-50">
          <p className="text-xs font-semibold text-zinc-600">
            Assigned ({assigned.length})
          </p>
        </div>
        {assigned.length === 0 ? (
          <p className="px-4 py-6 text-xs text-zinc-400 text-center">
            No staff assigned yet.
          </p>
        ) : (
          <ul className="divide-y divide-zinc-100 max-h-64 overflow-y-auto">
            {assigned.map((u) => (
              <li
                key={u._id}
                className="flex items-center justify-between px-4 py-2.5"
              >
                <div>
                  <p className="text-sm text-zinc-900">{u.name}</p>
                  <p className="text-xs text-zinc-400">{u.email}</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggle(u, "unassign")}
                  className="text-xs text-red-500 hover:text-red-700 transition-colors"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
        <div className="px-4 py-2.5 border-b border-zinc-100 bg-zinc-50">
          <p className="text-xs font-semibold text-zinc-600">
            Available Staff ({unassigned.length})
          </p>
        </div>
        {unassigned.length === 0 ? (
          <p className="px-4 py-6 text-xs text-zinc-400 text-center">
            All staff assigned.
          </p>
        ) : (
          <ul className="divide-y divide-zinc-100 max-h-64 overflow-y-auto">
            {unassigned.map((u) => (
              <li
                key={u._id}
                className="flex items-center justify-between px-4 py-2.5"
              >
                <div>
                  <p className="text-sm text-zinc-900">{u.name}</p>
                  <p className="text-xs text-zinc-400">{u.email}</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggle(u, "assign")}
                  className="text-xs text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  Assign
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
