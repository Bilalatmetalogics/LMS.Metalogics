import { create } from "zustand";
import { useEffect } from "react";

type NotifPayload = { type: string; message: string; link?: string };
type Listener = (payload: NotifPayload) => void;

interface NotifState {
  unread: number;
  refresh: () => Promise<void>;
  markRead: (ids: string[]) => Promise<void>;
  increment: (payload?: NotifPayload) => void;
  listeners: Listener[];
  subscribe: (fn: Listener) => () => void;
}

export const useNotifications = create<NotifState>((set, get) => ({
  unread: 0,
  listeners: [],

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

  increment: (payload?: NotifPayload) => {
    set((s) => ({ unread: s.unread + 1 }));
    if (payload) {
      get().listeners.forEach((fn) => fn(payload));
    }
  },

  subscribe: (fn: Listener) => {
    set((s) => ({ listeners: [...s.listeners, fn] }));
    return () =>
      set((s) => ({ listeners: s.listeners.filter((l) => l !== fn) }));
  },
}));

/**
 * Polling-based notification refresh.
 * Replaces Socket.io for environments that don't support persistent connections.
 * Polls every 30 seconds — notifications appear with a short delay.
 */
export function useNotificationPolling() {
  const refresh = useNotifications((s) => s.refresh);

  useEffect(() => {
    // Initial fetch
    refresh();

    // Poll every 30 seconds
    const interval = setInterval(() => {
      refresh();
    }, 30_000);

    return () => clearInterval(interval);
  }, [refresh]);
}
