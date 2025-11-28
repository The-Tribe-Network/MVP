import { Server, Socket } from "socket.io";
import { db } from "../database/client";
import { message, messageRead } from "../../lib/database/schemas/message";
import { eq } from "drizzle-orm";

export function setupMessagingHandlers(io: Server, socket: Socket, userId: string) {
  // Send message to tribe (group message)
  socket.on("message:send", async (data: {
    tribeId: string;
    content: string;
    messageType: "group" | "direct";
    recipientId?: string;
  }) => {
    // Save message to DB
    // Emit to appropriate room
    if (data.messageType === "group") {
      io.to(`tribe:${data.tribeId}`).emit("message:new", {
        senderId: userId,
        content: data.content,
        tribeId: data.tribeId,
        timestamp: new Date(),
      });
    } else if (data.messageType === "direct" && data.recipientId) {
      // Direct message - emit to both users
      socket.emit("message:new", {
        senderId: userId,
        recipientId: data.recipientId,
        content: data.content,
        timestamp: new Date(),
      });
      io.to(`user:${data.recipientId}`).emit("message:new", {
        senderId: userId,
        recipientId: data.recipientId,
        content: data.content,
        timestamp: new Date(),
      });
    }
  });

  // Mark message as read
  socket.on("message:read", async (data: { messageId: string }) => {
    // Update read status in DB
    socket.emit("message:read:confirmed", { messageId: data.messageId });
  });

  // Typing indicator
  socket.on("message:typing", (data: { tribeId: string; isTyping: boolean }) => {
    socket.to(`tribe:${data.tribeId}`).emit("message:typing", {
      userId,
      isTyping: data.isTyping,
    });
  });
}