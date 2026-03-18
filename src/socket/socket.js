import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

// Singleton socket — created once, reused across the app
const socket = io(SOCKET_URL, {
  autoConnect: false,  // We connect manually when joining a room
  transports: ['websocket'],
})

export default socket
