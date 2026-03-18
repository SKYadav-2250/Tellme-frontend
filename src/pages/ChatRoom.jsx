import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import socket from '../socket/socket'
import { encryptMessage } from '../utils/crypto'
import MessageBubble from '../components/MessageBubble'
import OnlineUsers from '../components/OnlineUsers'

const MAX_IMAGE_SIZE_MB = 5

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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const addNotification = useCallback((msg) => {
    const id = ++notifIdRef.current
    setNotifications(prev => [...prev, { id, msg }])
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 3500)
  }, [])

  // ── Socket lifecycle ──────────────────────────────────────────
  useEffect(() => {
    if (!token) return

    socket.connect()
    socket.emit('join-room', { roomId, token })

    const onConnect    = () => setConnectionStatus('connected')
    const onDisconnect = () => setConnectionStatus('disconnected')
    const onConnErr    = () => setConnectionStatus('error')

    const onHistory = (history) => setMessages(history)

    // FIX: Only add message from server echo — no optimistic append
    const onReceive = (message) => {
      setMessages(prev => [...prev, message])
    }

    const onUserJoined = ({ message, roomUsers: updated }) => {
      setRoomUsers(updated)
      addNotification(message)
    }

    const onUserLeft = ({ message, roomUsers: updated }) => {
      setRoomUsers(updated)
      addNotification(message)
    }

    const onError = ({ message: errMsg }) => addNotification(`⚠ ${errMsg}`)

    socket.on('connect',         onConnect)
    socket.on('disconnect',      onDisconnect)
    socket.on('connect_error',   onConnErr)
    socket.on('message-history', onHistory)
    socket.on('receive-message', onReceive)
    socket.on('user-joined',     onUserJoined)
    socket.on('user-left',       onUserLeft)
    socket.on('error',           onError)

    return () => {
      socket.off('connect',         onConnect)
      socket.off('disconnect',      onDisconnect)
      socket.off('connect_error',   onConnErr)
      socket.off('message-history', onHistory)
      socket.off('receive-message', onReceive)
      socket.off('user-joined',     onUserJoined)
      socket.off('user-left',       onUserLeft)
      socket.off('error',           onError)
      socket.disconnect()
    }
  }, [roomId, token, addNotification])

  // ── Send text ────────────────────────────────────────────────
  const sendMessage = (e) => {
    e?.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return

    const encryptedText = encryptMessage(trimmed, roomId)
    // Emit only — server echo via receive-message will add it to state
    socket.emit('send-message', {
      roomId,
      encryptedText,
      type: 'text',
      token,
      timestamp: new Date().toISOString(),
    })
    setText('')
  }

  // ── Send image ───────────────────────────────────────────────
  const handleImageSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      addNotification(`⚠ Image too large. Max ${MAX_IMAGE_SIZE_MB}MB.`)
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      // Emit only — server echo handles display
      socket.emit('send-message', {
        roomId,
        imageData: reader.result,
        type: 'image',
        token,
        timestamp: new Date().toISOString(),
      })
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const copyRoomLink = async () => {
    await navigator.clipboard.writeText(window.location.href).catch(() => {})
    addNotification('✓ Room link copied!')
  }

  const statusDot = {
    connecting:   'bg-yellow-400 animate-pulse',
    connected:    'bg-green-400',
    disconnected: 'bg-red-400',
    error:        'bg-red-400',
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950">

      {/* ── Ambient orbs ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 -left-32 w-80 h-80 bg-brand-600/10 rounded-full blur-3xl" />
      </div>

      {/* ── Navbar ── */}
      <header className="relative z-20 flex items-center justify-between px-4 sm:px-6 py-3.5
                         border-b border-white/10 bg-slate-900/70 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 rounded-xl hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
            aria-label="Back"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div>
            <div className="flex items-center gap-2">
              {/* Chat icon */}
              <div className="w-7 h-7 rounded-lg bg-brand-500/20 border border-brand-500/30
                              flex items-center justify-center shrink-0">
                <svg className="w-3.5 h-3.5 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <span className="font-semibold text-white text-sm sm:text-base truncate max-w-[120px] sm:max-w-xs">
                Room · {roomId.slice(0, 8)}…
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5 ml-9">
              <span className={`w-1.5 h-1.5 rounded-full ${statusDot[connectionStatus]}`} />
              <span className="text-xs text-slate-400">
                {roomUsers.length} {roomUsers.length === 1 ? 'person' : 'people'} online
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* E2E badge */}
          <span className="hidden sm:flex items-center gap-1.5 text-xs text-brand-400
                           bg-brand-500/10 border border-brand-500/20 px-2.5 py-1 rounded-full mr-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Encrypted
          </span>

          {/* Copy link */}
          <button
            onClick={copyRoomLink}
            className="p-2 rounded-xl hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
            title="Copy room link"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </button>

          {/* Members toggle (mobile) */}
          <button
            onClick={() => setSidebarOpen(v => !v)}
            className="p-2 rounded-xl hover:bg-white/10 transition-colors text-slate-400 hover:text-white lg:hidden relative"
            aria-label="Toggle members"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {roomUsers.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-brand-500 text-white
                               text-[9px] font-bold rounded-full flex items-center justify-center">
                {roomUsers.length}
              </span>
            )}
          </button>

          {/* Sign out */}
          <button
            onClick={() => { logout(); navigate('/login') }}
            className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 hover:text-white
                       transition-colors px-3 py-1.5 rounded-xl hover:bg-white/10"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign out
          </button>
        </div>
      </header>

      {/* ── Floating notifications ── */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center w-full pointer-events-none px-4">
        {notifications.map(n => (
          <div key={n.id}
               className="bg-slate-800/95 backdrop-blur-md border border-white/10 text-slate-300
                          text-xs text-center px-5 py-2.5 rounded-full shadow-2xl animate-fade-in
                          pointer-events-none">
            {n.msg}
          </div>
        ))}
      </div>

      {/* ── Body ── */}
      <div className="relative flex flex-1 overflow-hidden z-10">

        {/* ── Messages column ── */}
        <main className="flex-1 flex flex-col overflow-hidden">

          {/* Message list */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-3">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in gap-4">
                <div className="w-20 h-20 rounded-3xl bg-brand-500/10 border border-brand-500/20
                                flex items-center justify-center shadow-xl">
                  <svg className="w-10 h-10 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-semibold text-lg">No messages yet</p>
                  <p className="text-slate-400 text-sm mt-1">
                    Share the room link to invite someone and start chatting!
                  </p>
                </div>
                <button
                  onClick={copyRoomLink}
                  className="btn-primary flex items-center gap-2 text-sm"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  Copy Room Link
                </button>
              </div>
            ) : (
              messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  isOwn={msg.senderId === user.id}
                  roomId={roomId}
                />
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* ── Input bar ── */}
          <div className="shrink-0 px-4 sm:px-6 py-4 border-t border-white/10 bg-slate-900/60 backdrop-blur-xl">
            <form onSubmit={sendMessage} className="flex items-center gap-2.5">

              {/* Image button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="shrink-0 p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-all
                           active:scale-95 text-slate-400 hover:text-white"
                aria-label="Send image"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageSelect} />

              {/* Text input */}
              <div className="relative flex-1">
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type a message…"
                  className="w-full bg-white/10 border border-white/15 rounded-2xl px-4 py-3 text-white
                             placeholder-slate-500 text-sm focus:outline-none focus:ring-2
                             focus:ring-brand-500 focus:border-transparent transition-all"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
                  }}
                />
              </div>

              {/* Send button */}
              <button
                type="submit"
                disabled={!text.trim()}
                className="shrink-0 w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-500 to-teal-500
                           hover:from-brand-400 hover:to-teal-400 disabled:opacity-40 disabled:cursor-not-allowed
                           transition-all active:scale-95 flex items-center justify-center shadow-lg
                           shadow-brand-500/25"
                aria-label="Send"
              >
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>

            <p className="text-center text-[11px] text-slate-600 mt-2.5 flex items-center justify-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              End-to-end encrypted · Messages vanish on close
            </p>
          </div>
        </main>

        {/* ── Online Users Sidebar ── */}
        {/* Mobile overlay backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar panel */}
        <aside
          className={`
            fixed top-0 right-0 h-full z-40
            lg:relative lg:z-auto lg:translate-x-0
            transition-transform duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}
            w-64 flex flex-col
          `}
        >
          <div className="h-full pt-[57px] lg:pt-0 flex flex-col">
            <OnlineUsers users={roomUsers} currentUserId={user?.id} />
          </div>
        </aside>
      </div>
    </div>
  )
}

export default ChatRoom
