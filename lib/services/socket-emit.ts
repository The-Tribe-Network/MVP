import { io } from "socket.io-client";

const SOCKET_SERVER_URL = process.env.SOCKET_SERVER_URL || "http://localhost:3001";

// Create a server-side socket client (admin connection)
const adminSocket = io(SOCKET_SERVER_URL, {
  auth: {
    token: process.env.SOCKET_ADMIN_TOKEN, // You'll create this
  },
});

export async function emitInviteCreated(data: {
  tribeId: string;
  email: string;
  inviterId: string;
}) {
  adminSocket.emit("invite:created", data);
}

export async function emitNotification(data: {
  userId: string;
  type: string;
  title: string;
  message: string;
  link?: string;
}) {
  adminSocket.emit("notification:send", data);
}