import { io } from 'socket.io-client'
import { SOCKET_BASE_URL } from '../runtimeConfig'

const socket = io(SOCKET_BASE_URL, {
  autoConnect: false,
  transports: ['websocket', 'polling'],
})

export default socket
