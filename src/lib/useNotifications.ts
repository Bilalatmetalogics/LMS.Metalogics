import { create } from "zustand";

interface NotifState {
  unread: number;
  refresh: () => Promise<void>;
  markRead: (ids: string[]) => Promise<void>;
}

export const useNotifications = create<NotifState>((set) => ({
  unread: 0,
  refresh: async () => {
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) return;
      const data = await res.json();
      const count = data.filter((n: any) => !n.read).length;
      set({ unread: count });
    } catch {}
  },
  markRead: async (ids: string[]) => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      set({ unread: 0 });
    } catch {}
  },
}));
