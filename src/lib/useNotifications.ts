// Zustand store for live notification badge count
// Components call refresh() after adding a notification so TopBar updates instantly

import { create } from "zustand";
import { db } from "./mockStore";

interface NotifState {
  unread: number;
  refresh: (userId: string) => void;
}

export const useNotifications = create<NotifState>((set) => ({
  unread: 0,
  refresh: (userId: string) => {
    const count = db.notifications
      .forUser(userId)
      .filter((n) => !n.read).length;
    set({ unread: count });
  },
}));
