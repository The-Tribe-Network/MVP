import { Server } from "socket.io";
import { createServer } from "http";
import { authenticationMiddleware } from "./helpers/auth";
import { setupInviteHandlers } from "./handlers/invites";
import { setupNotificationHandlers } from "./handlers/notifications";
import { setupAnnouncementHandlers } from "./handlers/announcements";
import { setupMessagingHandlers } from "./handlers/messaging";
import * as dotenv from "dotenv";
import type { SocketWithUser } from "./types/socketio";

dotenv.config();

const { SOCKET_PORT, PUBLIC_APP_URL } = process.env;

if (!SOCKET_PORT || !PUBLIC_APP_URL) {
  if (!SOCKET_PORT) {
    throw new Error("SOCKET_PORT is not set");
  }
  if (!PUBLIC_APP_URL) {
    throw new Error("PUBLIC_APP_URL is not set");
  }
}

const PORT = parseInt(SOCKET_PORT);

if (isNaN(PORT)) {
  throw new Error("SOCKET_PORT is not a number");
}

// Create HTTP server (Socket.io needs it)
const httpServer = createServer();

// Initialize Socket.io with CORS for your Next.js app
const io = new Server(httpServer, {
  cors: {
    origin: PUBLIC_APP_URL,
    credentials: true,
    methods: ["GET", "POST"],
  },
  transports: ["websocket", "polling"],
});

// Authentication middleware
io.use(authenticationMiddleware(io));

// Store active connections by user ID
const userSockets = new Map<string, Set<string>>();

io.on("connection", async (socket) => {
  const user = (socket as SocketWithUser).data.user;

  if (!user) {
    socket.disconnect();
    return;
  }

  console.log(`User ${user.id} (${user.email}) connected: ${socket.id}`);

  // Track user connections
  if (!userSockets.has(user.id)) {
    userSockets.set(user.id, new Set());
  }
  userSockets.get(user.id)!.add(socket.id);

  // Join user's personal room for notifications
  socket.join(`user:${user.id}`);

  // Get user's tribes and join their rooms
  // You'll need to import your database queries here
  // const userTribes = await getUserTribes(user.id);
  // for (const tribe of userTribes) {
  //   socket.join(`tribe:${tribe.id}`);
  // }

  // Setup event handlers
  setupInviteHandlers(io, socket, user.id);
  setupNotificationHandlers(io, socket, user.id);
  setupAnnouncementHandlers(io, socket, user.id);
  setupMessagingHandlers(io, socket, user.id);

  socket.on("disconnect", () => {
    console.log(`User ${user.id} disconnected: ${socket.id}`);

    // Remove from tracking
    const userSocketSet = userSockets.get(user.id);
    if (userSocketSet) {
      userSocketSet.delete(socket.id);
      if (userSocketSet.size === 0) {
        userSockets.delete(user.id);
      }
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`🚀 Socket.io server running on port ${PORT}`);
});