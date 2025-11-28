import { Server, Socket } from "socket.io";
import { db } from "../database/client";
import { tribeInvitation, tribeMember } from "@/database/schemas/tribe";
import { user } from "@/database/schemas/auth";
import { eq, and } from "drizzle-orm";

export function setupInviteHandlers(io: Server, socket: Socket, userId: string) {
  // Listen for new invitation created (from Next.js API)
  socket.on("invite:created", async (data: { tribeId: string; email: string }) => {
    // Verify user has permission to send invites
    // Emit to the invited user if they're online
    const [invitedUser] = await db
      .select()
      .from(user)
      .where(eq(user.email, data.email))
      .limit(1);

    if (invitedUser) {
      io.to(`user:${invitedUser.id}`).emit("invite:received", {
        tribeId: data.tribeId,
        inviterId: userId,
      });
    }
  });

  // Listen for invitation acceptance
  socket.on("invite:accept", async (data: { invitationId: string }) => {
    // Handle invite acceptance
    // Notify tribe members
    // You can emit to the tribe room
  });

  // Join tribe room when user accepts invite
  socket.on("invite:accepted", async (data: { tribeId: string }) => {
    socket.join(`tribe:${data.tribeId}`);
    // Notify tribe members
    io.to(`tribe:${data.tribeId}`).emit("member:joined", {
      userId,
      tribeId: data.tribeId,
    });
  });
}