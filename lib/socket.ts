import { io, Socket } from "socket.io-client";
import { getStoredToken, SOCKET_URL } from "./api";

let socketInstance: Socket | null = null;

export function getSocket(): Socket {
  const token = getStoredToken();
  if (socketInstance) {
    const currentToken = (socketInstance.auth as { token?: string } | undefined)?.token;
    if (currentToken === token) {
      if (!socketInstance.connected) socketInstance.connect();
      return socketInstance;
    }
    socketInstance.disconnect();
    socketInstance = null;
  }

  socketInstance = io(SOCKET_URL, {
    transports: ["websocket", "polling"],
    withCredentials: true,
    auth: { token: token || undefined },
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  });

  return socketInstance;
}

export function resetSocket(): void {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}
