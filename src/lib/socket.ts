import type { Server as SocketIOServer } from "socket.io";

// Global singleton — set once by server.ts, read by API routes
let _io: SocketIOServer | null = null;

export function initSocket(io: SocketIOServer) {
  _io = io;
}

export function getIO(): SocketIOServer | null {
  return _io;
}

/**
 * Emit a notification event to a specific user's socket room.
 * Safe to call from any API route — no-ops if socket server isn't running.
 */
export function emitNotification(
  userId: string,
  payload: { message: string; type: string; link?: string },
) {
  _io?.to(`user:${userId}`).emit("notification", payload);
}

/**
 * Emit to multiple users at once (e.g. announcements).
 */
export function emitNotificationToMany(
  userIds: string[],
  payload: { message: string; type: string; link?: string },
) {
  userIds.forEach((uid) => emitNotification(uid, payload));
}
