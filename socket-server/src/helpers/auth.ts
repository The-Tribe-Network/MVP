import { Socket, Server } from "socket.io";
import auth from "../services/auth";

export function authenticationMiddleware(io: Server) {
  return async (socket: Socket, next: (err?: any) => void) => {
    try {
      const cookies = socket.handshake.headers.cookie;

      if (!cookies) {
        return next(new Error("Unauthorized"));
      }

      const session = await auth.api.getSession({
        headers: {
          cookie: cookies,
        },
      });

      if (!session) {
        return next(new Error("Unauthorized"));
      }

      socket.data.user = session.user;
      socket.data.session = session.session;
      next();
    } catch (error) {
      console.error("Authentication error:", error);
      next(new Error("Unauthorized"));
    }
  };
}