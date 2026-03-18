"use client";

import { useState } from "react";
import { db, MockUser } from "@/lib/mockStore";

export default function AssignUsers({
  courseId,
  assigned: init_a,
  unassigned: init_u,
}: {
  courseId: string;
  assigned: MockUser[];
  unassigned: MockUser[];
}) {
  const [assigned, setAssigned] = useState(init_a);
  const [unassigned, setUnassigned] = useState(init_u);

  function toggle(user: MockUser, action: "assign" | "unassign") {
    const u = db.users.findById(user.id)!;
    if (action === "assign") {
      db.users.upsert({
        ...u,
        assignedCourses: [...u.assignedCourses, courseId],
      });
      setAssigned((p) => [...p, user]);
      setUnassigned((p) => p.filter((x) => x.id !== user.id));
    } else {
      db.users.upsert({
        ...u,
        assignedCourses: u.assignedCourses.filter((c) => c !== courseId),
      });
      setUnassigned((p) => [...p, user]);
      setAssigned((p) => p.filter((x) => x.id !== user.id));
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
                key={u.id}
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
                key={u.id}
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
