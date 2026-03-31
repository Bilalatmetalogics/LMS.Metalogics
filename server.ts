import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server as SocketIOServer } from "socket.io";
import { initSocket } from "./src/lib/socket";

const dev = process.env.NODE_ENV !== "production";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  const io = new SocketIOServer(httpServer, {
    path: "/api/socketio",
    cors: {
      origin: process.env.AUTH_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  // Store io on global so API routes can emit events
  initSocket(io);

  io.on("connection", (socket) => {
    // Client sends their userId after connecting so we can route events
    socket.on("join", (userId: string) => {
      socket.join(`user:${userId}`);
    });

    socket.on("disconnect", () => {});
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
