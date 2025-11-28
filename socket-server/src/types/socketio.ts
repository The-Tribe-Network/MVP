import { Session, User } from "better-auth";
import { Socket } from "socket.io";

export interface SocketWithUser extends Socket {
  data: {
    user: User;
    session: Session;
  };
}