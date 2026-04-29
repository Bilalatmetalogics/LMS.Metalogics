"use client";

import { useState } from "react";
import { UserPlus, UserMinus } from "lucide-react";

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

  const Panel = ({
    title,
    users,
    action,
    actionLabel,
    actionColor,
  }: {
    title: string;
    users: User[];
    action: "assign" | "unassign";
    actionLabel: string;
    actionColor: string;
  }) => (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
      <div className="px-4 py-3 border-b border-white/10 bg-white/[0.02]">
        <p className="text-xs font-semibold text-slate-300">
          {title} ({users.length})
        </p>
      </div>
      {users.length === 0 ? (
        <p className="px-4 py-8 text-xs text-slate-500 text-center">
          {action === "assign"
            ? "All staff assigned."
            : "No staff assigned yet."}
        </p>
      ) : (
        <ul className="divide-y divide-white/5 max-h-64 overflow-y-auto">
          {users.map((u) => (
            <li
              key={u._id}
              className="flex items-center justify-between px-4 py-3 hover:bg-white/[0.03] transition-colors"
            >
              <div>
                <p className="text-sm text-white">{u.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">{u.email}</p>
              </div>
              <button
                type="button"
                onClick={() => toggle(u, action)}
                className={`flex items-center gap-1 text-xs font-medium transition-colors ${actionColor}`}
              >
                {action === "assign" ? (
                  <UserPlus className="h-3.5 w-3.5" />
                ) : (
                  <UserMinus className="h-3.5 w-3.5" />
                )}
                {actionLabel}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      <Panel
        title="Assigned"
        users={assigned}
        action="unassign"
        actionLabel="Remove"
        actionColor="text-red-400 hover:text-red-300"
      />
      <Panel
        title="Available Staff"
        users={unassigned}
        action="assign"
        actionLabel="Assign"
        actionColor="text-indigo-400 hover:text-indigo-300"
      />
    </div>
  );
}
