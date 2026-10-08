import { io, type Socket } from "socket.io-client"
import { DEFAULT_CHAT_API_URL } from "./upstream"

/**
 * Socket server URL.
 * Prefer explicit public API host — Next rewrites don't proxy WebSockets reliably.
 */
const socketServerUrl = () =>
  (
    process.env.NEXT_PUBLIC_CHAT_API_URL ||
    process.env.NEXT_PUBLIC_CHAT_SOCKET_URL ||
    DEFAULT_CHAT_API_URL
  ).replace(/\/$/, "")

let socket: Socket | null = null

export const getCustomerSocket = (): Socket => {
  if (!socket) {
    socket = io(socketServerUrl(), {
      path: "/socket.io",
      transports: ["polling", "websocket"],
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 800,
      reconnectionDelayMax: 5000,
    })
  }
  return socket
}

export const connectCustomerSocket = () => {
  const s = getCustomerSocket()
  if (!s.connected) s.connect()
  return s
}

export const joinConversation = (conversationId: string) => {
  if (!conversationId) return
  const s = connectCustomerSocket()
  s.emit("join:conversation", { conversationId })
}

export const disconnectCustomerSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
