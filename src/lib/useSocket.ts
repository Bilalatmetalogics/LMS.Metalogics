"use client";

import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

let _socket: Socket | null = null;

function getSocket(): Socket {
  if (!_socket) {
    _socket = io({
      path: "/api/socketio",
      // Reconnect automatically
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });
  }
  return _socket;
}

/**
 * Connect to the Socket.io server and join the user's private room.
 * Returns the socket instance.
 */
export function useSocket(userId: string | undefined) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!userId) return;

    const socket = getSocket();
    socketRef.current = socket;

    if (socket.connected) {
      socket.emit("join", userId);
    } else {
      socket.once("connect", () => {
        socket.emit("join", userId);
      });
    }

    return () => {
      // Don't disconnect on unmount — keep the singleton alive
    };
  }, [userId]);

  return socketRef.current ?? getSocket();
}
