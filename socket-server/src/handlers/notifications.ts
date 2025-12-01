import { Server, Socket } from "socket.io";
import { db } from "../database/client";
import { notification } from "../../lib/database/schemas/activity";

export function setupNotificationHandlers(io: Server, socket: Socket, userId: string) {
  // Emit notification to specific user
  socket.on("notification:send", async (data: {
    userId: string;
    type: string;
    title: string;
    message: string;
    link?: string
  }) => {
    // Create notification in DB
    // Emit to user's room
    io.to(`user:${data.userId}`).emit("notification:new", data);
  });

  // Mark notification as read
  socket.on("notification:read", async (data: { notificationId: string }) => {
    // Update in DB
    // Optionally emit confirmation
  });
}                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              