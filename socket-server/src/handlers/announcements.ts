import { Server, Socket } from "socket.io";

export function setupAnnouncementHandlers(io: Server, socket: Socket, userId: string) {
  // Send announcement to tribe
  socket.on("announcement:send", async (data: {
    tribeId: string;
    title: string;
    message: string;
  }) => {
    // Verify user has permission (admin/moderator)
    // Emit to tribe room
    io.to(`tribe:${data.tribeId}`).emit("announcement:new", {
      tribeId: data.tribeId,
      title: data.title,
      message: data.message,
      createdBy: userId,
      timestamp: new Date(),
    });
  });
}