import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import socket from '../socket/socket'
import { encryptMessage } from '../utils/crypto'
import MessageBubble from '../components/MessageBubble'
import OnlineUsers from '../components/OnlineUsers'

const MAX_IMAGE_SIZE_MB = 5

const formatDayLabel = (timestamp) => {
  const date = timestamp ? new Date(timestamp) : new Date()
  const today = new Date()
  if (date.toDateString() === today.toDateString()) return 'Today'
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

const getMessageFingerprint = (message) =>
  [
    message.id,
    message.senderId,
    message.timestamp,
    message.type,
    message.encryptedText || message.text,
    message.imageData?.slice(0, 48),
  ]
    .filter(Boolean)
    .join('|')

const normalizeMessage = (message) => {
  if (!message || typeof message !== 'object') return null

  const sender = message.sender || {}
  const type = message.type || (message.imageData ? 'image' : 'text')

  return {
    ...message,
    id: message.id || message._id || `${message.senderId || sender.id || 'guest'}-${message.timestamp || Date.now()}`,
    senderId: message.senderId || message.userId || sender.id || sender._id || '',
    senderName: message.senderName || message.name || sender.name || 'Anonymous',
    encryptedText: message.encryptedText || message.text || '',
    imageData: message.imageData || message.image || '',
    type,
    timestamp: message.timestamp || message.createdAt || new Date().toISOString(),
  }
}

const ChatRoom = () => {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const { user, token, logout } = useAuth()

  const [messages, setMessages] = useState([])
  const [roomUsers, setRoomUsers] = useState([])
  const [text, setText] = useState('')
  const [notifications, setNotifications] = useState([])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState('connecting')

  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)
  const notifIdRef = useRef(0)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const addNotification = useCallback((msg) => {
    const id = ++notifIdRef.current
    setNotifications((prev) => [...prev, { id, msg }])
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id))
    }, 3500)
  }, [])

  const appendUniqueMessage = useCallback((incoming) => {
    const normalized = normalizeMessage(incoming)
    if (!normalized) return

    setMessages((prev) => {
      const nextFingerprint = getMessageFingerprint(normalized)
      const alreadyExists = prev.some(
        (item) => getMessageFingerprint(item) === nextFingerprint
      )
      return alreadyExists ? prev : [...prev, normalized]
    })
  }, [])

  const handleSocketError = useCallback(({ message: errMsg } = {}) => {
    addNotification(errMsg ? `Warning: ${errMsg}` : 'Something went wrong.')
  }, [addNotification])

  useEffect(() => {
    if (!token) return

    socket.auth = { token }
    socket.connect()
    socket.emit('join-room', { roomId, token })

    const onConnect = () => setConnectionStatus('connected')
    const onDisconnect = () => setConnectionStatus('disconnected')
    const onConnErr = () => setConnectionStatus('error')

    const onHistory = (history) => {
      const normalizedHistory = Array.isArray(history)
        ? history.map(normalizeMessage).filter(Boolean)
        : []
      setMessages(normalizedHistory)
    }

    const onReceive = (message) => {
      appendUniqueMessage(message)
    }

    const onUserJoined = ({ message, roomUsers: updated }) => {
      setRoomUsers(Array.isArray(updated) ? updated : [])
      if (message) addNotification(message)
    }

    const onUserLeft = ({ message, roomUsers: updated }) => {
      setRoomUsers(Array.isArray(updated) ? updated : [])
      if (message) addNotification(message)
    }

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.on('connect_error', onConnErr)
    socket.on('message-history', onHistory)
    socket.on('receive-message', onReceive)
    socket.on('user-joined', onUserJoined)
    socket.on('user-left', onUserLeft)
    socket.on('error', handleSocketError)

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('connect_error', onConnErr)
      socket.off('message-history', onHistory)
      socket.off('receive-message', onReceive)
      socket.off('user-joined', onUserJoined)
      socket.off('user-left', onUserLeft)
      socket.off('error', handleSocketError)
      socket.disconnect()
    }
  }, [roomId, token, addNotification, appendUniqueMessage, handleSocketError])

  const sendMessage = (e) => {
    e?.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return

    const encryptedText = encryptMessage(trimmed, roomId)
    const timestamp = new Date().toISOString()
    
    // Optimistic update - add message immediately
    const optimisticMessage = {
      id: `${user?.id}-${timestamp}`,
      senderId: user?.id,
      senderName: user?.name || 'You',
      encryptedText,
      text: trimmed,
      type: 'text',
      timestamp,
    }
    appendUniqueMessage(optimisticMessage)
    
    socket.emit('send-message', {
      roomId,
      encryptedText,
      type: 'text',
      token,
      timestamp,
    })
    setText('')
  }

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      addNotification(`Image too large. Max ${MAX_IMAGE_SIZE_MB}MB.`)
      e.target.value = ''
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const timestamp = new Date().toISOString()
      // Optimistic update for image
      const optimisticMessage = {
        id: `${user?.id}-${timestamp}`,
        senderId: user?.id,
        senderName: user?.name || 'You',
        imageData: reader.result,
        type: 'image',
        timestamp,
      }
      appendUniqueMessage(optimisticMessage)
      
      socket.emit('send-message', {
        roomId,
        imageData: reader.result,
        type: 'image',
        token,
        timestamp,
      })
    }
    reader.readAsDataURL(file)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const copyRoomLink = async () => {
    await navigator.clipboard.writeText(window.location.href).catch(() => {})
    addNotification('Room link copied.')
  }

  const statusDot = {
    connecting: 'bg-yellow-400 animate-pulse',
    connected: 'bg-green-400',
    disconnected: 'bg-red-400',
    error: 'bg-red-400',
  }

  const roomTitle = `Room ${roomId.slice(0, 8)}`
  const dayLabel = formatDayLabel(messages[0]?.timestamp)

  return (
    <div className="relative h-[100dvh] overflow-hidden bg-[#0b1326] text-[#dae2fd]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(98,250,227,0.08),transparent_26%),radial-gradient(circle_at_bottom_left,rgba(123,208,255,0.08),transparent_22%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(45,212,191,0.12),transparent_18%),radial-gradient(circle_at_80%_70%,rgba(97,211,255,0.08),transparent_16%)]" />
      </div>

      <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between bg-[#0b1326]/95 px-4 backdrop-blur-md sm:px-6">
        <div className="flex min-w-0 items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="rounded-full p-2 text-[#bacac5] transition-colors hover:bg-white/5 hover:text-white"
            aria-label="Back"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold tracking-tight text-[#2dd4bf]">
              {roomTitle}
            </h1>
            <div className="mt-0.5 flex items-center gap-2">
              <span className={`h-1.5 w-1.5 rounded-full ${statusDot[connectionStatus]}`} />
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#bacac5]">
                {roomUsers.length} {roomUsers.length === 1 ? 'Member' : 'Members'} Online
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={copyRoomLink}
            className="hidden items-center gap-2 rounded-full border border-[#57f1db]/20 bg-[#57f1db]/10 px-4 py-2 text-xs font-medium text-[#57f1db] transition-all hover:bg-[#57f1db]/20 active:scale-95 md:flex"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 10h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            Copy Room Link
          </button>

          <button
            onClick={() => setSidebarOpen((value) => !value)}
            className="rounded-full p-2 text-[#bacac5] transition-colors hover:bg-white/5 hover:text-white"
            aria-label="Toggle members"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6h.01M12 12h.01M12 18h.01" />
            </svg>
          </button>
        </div>
      </header>

      <main className="relative flex h-full flex-col overflow-hidden bg-[#0b1326] pb-28 pt-16 md:pb-24">
        <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 sm:py-8">
          <div className="scrollbar-hide mx-auto w-full max-w-4xl space-y-6">
            <div className="my-4 flex justify-center">
              <span className="rounded-full bg-[#131b2e] px-4 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#bacac5]/60">
                {dayLabel}
              </span>
            </div>

            {messages.length === 0 ? (
              <div className="flex min-h-[55vh] flex-col items-center justify-center gap-4 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#171f33] text-[#57f1db]">
                  <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.6}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-lg font-semibold text-white">No messages yet</p>
                  <p className="mt-1 text-sm text-[#bacac5]">
                    Share the room link and start the conversation.
                  </p>
                </div>
                <button
                  onClick={copyRoomLink}
                  className="rounded-full border border-[#57f1db]/20 bg-[#57f1db]/10 px-4 py-2 text-sm font-medium text-[#57f1db] transition-all hover:bg-[#57f1db]/20"
                >
                  Copy Room Link
                </button>
              </div>
            ) : (
              messages.map((msg, index) => (
                <MessageBubble
                  key={`${msg.id}-${index}`}
                  message={msg}
                  isOwn={msg.senderId === user?.id}
                  roomId={roomId}
                />
              ))
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      </main>

      <div className="pointer-events-none fixed left-1/2 top-20 z-40 flex w-full -translate-x-1/2 flex-col items-center gap-2 px-4">
        {notifications.map((n) => (
          <div
            key={n.id}
            className="rounded-full border border-white/10 bg-[#171f33]/95 px-4 py-2 text-center text-xs text-[#dae2fd] shadow-2xl backdrop-blur-md"
          >
            {n.msg}
          </div>
        ))}
      </div>

      <footer className="fixed inset-x-0 bottom-0 z-30 bg-gradient-to-t from-[#0b1326] via-[#0b1326]/90 to-transparent px-4 pb-6 pt-2 md:pb-8">
        <div className="mx-auto flex max-w-4xl items-center gap-3 rounded-[2rem] border border-[#3c4a46]/20 bg-[#222a3d]/40 p-2 shadow-2xl backdrop-blur-xl">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex h-10 w-10 items-center justify-center rounded-full text-[#bacac5] transition-all hover:bg-white/5 hover:text-[#57f1db]"
            aria-label="Add image"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleImageSelect}
          />

          <form onSubmit={sendMessage} className="flex flex-1 items-center gap-3">
            <div className="flex-1">
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Write a message..."
                className="w-full border-none bg-transparent px-1 py-3 text-sm text-[#dae2fd] placeholder:text-[#bacac5]/50 focus:outline-none focus:ring-0"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    sendMessage()
                  }
                }}
              />
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={copyRoomLink}
                className="hidden h-10 w-10 items-center justify-center rounded-full text-[#bacac5] transition-all hover:bg-white/5 hover:text-[#57f1db] sm:flex"
                aria-label="Copy room link"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 10h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </button>

              <button
                type="submit"
                disabled={!text.trim()}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#2dd4bf] to-[#57f1db] text-[#003731] shadow-[0_4px_15px_rgba(45,212,191,0.3)] transition-transform hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Send"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12l14-7-4 7 4 7-14-7z" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </footer>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 right-0 z-50 w-[min(88vw,22rem)] transform border-l border-white/10 bg-[#0b1326] shadow-2xl backdrop-blur-xl transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full'
        } lg:relative lg:inset-auto lg:z-10 lg:w-80 lg:translate-x-0`}
      >
        <div className="flex h-full flex-col pt-16 lg:pt-0">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 lg:hidden">
            <p className="text-sm font-semibold text-white">Members</p>
            <button
              onClick={() => setSidebarOpen(false)}
              className="rounded-full p-2 text-[#bacac5] transition-colors hover:bg-white/5 hover:text-white"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <OnlineUsers users={roomUsers} currentUserId={user?.id} />

          <div className="border-t border-white/10 p-4">
            <button
              onClick={() => {
                logout()
                navigate('/login')
              }}
              className="w-full rounded-full border border-white/10 px-4 py-2 text-sm text-[#bacac5] transition-colors hover:bg-white/5 hover:text-white"
            >
              Sign out
            </button>
          </div>
        </div>
      </aside>
    </div>
  )
}

export default ChatRoom
