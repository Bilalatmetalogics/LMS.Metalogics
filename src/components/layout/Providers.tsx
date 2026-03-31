"use client";

import { SessionProvider, useSession } from "next-auth/react";
import type { Session } from "next-auth";
import { useEffect } from "react";
import { useSocket } from "@/lib/useSocket";
import { useNotifications } from "@/lib/useNotifications";

// Inner component — runs inside SessionProvider so it can call useSession
function SocketInitializer() {
  const { data: session } = useSession();
  const userId = (session?.user as any)?.id as string | undefined;
  const socket = useSocket(userId);
  const { increment } = useNotifications();

  useEffect(() => {
    if (!socket) return;

    function onNotification(payload: {
      type: string;
      message: string;
      link?: string;
    }) {
      increment(payload);
    }

    socket.on("notification", onNotification);
    return () => {
      socket.off("notification", onNotification);
    };
  }, [socket, increment]);

  return null;
}

export default function Providers({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session | null;
}) {
  return (
    <SessionProvider session={session}>
      <SocketInitializer />
      {children}
    </SessionProvider>
  );
}
