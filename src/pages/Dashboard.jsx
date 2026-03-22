import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { v4 as uuidv4 } from '../utils/uuid'
import { useAuth } from '../context/AuthContext'

const Dashboard = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const [roomLink, setRoomLink] = useState('')
  const [copied, setCopied] = useState(false)
  const redirectTarget = new URLSearchParams(location.search).get('redirect')

  const createRoom = () => {
    const roomId = uuidv4()
    const link = `${window.location.origin}/room/${roomId}`
    // Require login before creating/entering a room. If not logged in,
    // send the user to login and preserve the room path so they land
    // in the room after authentication.
    if (!user) {
      navigate(`/login?redirect=${encodeURIComponent(`/room/${roomId}`)}`)
      return
    }

    setRoomLink(link)
    setCopied(false)
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(roomLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // fallback
      const el = document.createElement('textarea')
      el.value = roomLink
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  const goToRoom = () => {
    if (!roomLink) return
    const path = new URL(roomLink).pathname
    navigate(path)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 flex flex-col">
      {/* Background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-brand-600/10 rounded-full blur-3xl" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center">
            <svg className="w-5 h-5 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <span className="font-bold text-white text-lg">TellMe</span>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-slate-400 text-sm  sm:block">
                Hi, <span className="text-white font-medium">{user?.name}</span>
              </span>
              <button
                onClick={logout}
                className="text-sm text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/10"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              to={`/login?redirect=${encodeURIComponent(location.pathname + location.search || '/dashboard')}`}
              className="text-sm text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/10"
            >
              Sign in
            </Link>
          )}
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center relative z-10 p-6">
        <div className="w-full max-w-lg text-center animate-fade-in">
          {/* Hero */}
          <div className="mb-10">
            <div className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-400 bg-brand-500/10 border border-brand-500/20 px-3 py-1.5 rounded-full mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse-dot" />
              End-to-end encrypted
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-white leading-tight">
              Start a private<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-teal-300">
                conversation
              </span>
            </h2>
            <p className="mt-4 text-slate-400 text-lg">
              Create a room — share the link — chat instantly.<br />
              Messages vanish when you leave.
            </p>
          </div>

          {/* Prompt for direct-link access */}
          {redirectTarget && !user && (
            <div className="glass-card p-4 mb-6">
              <p className="text-sm text-slate-300 mb-3">
                You were trying to open a room. Please sign in to join the room.
              </p>
              <div className="flex gap-2 justify-center">
                <Link
                  to={`/login?redirect=${encodeURIComponent(redirectTarget)}`}
                  className="btn-primary px-4 py-2"
                >
                  Sign in to join
                </Link>
              </div>
            </div>
          )}

          {/* Create room card */}
          <div className="glass-card p-8 animate-slide-up">
            <button
              onClick={createRoom}
              className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-3"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 4v16m8-8H4" />
              </svg>
              Create New Room
            </button>

            {roomLink && (
              <div className="mt-6 animate-slide-up">
                <p className="text-slate-400 text-sm mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  Share this link with your chat partner
                </p>

                <div className="flex items-center gap-2 bg-white/5 rounded-xl p-3 border border-white/10">
                  <p className="flex-1 text-sm text-slate-300 truncate font-mono">{roomLink}</p>
                  <button
                    onClick={copyLink}
                    className={`shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${copied
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-brand-500/20 text-brand-400 border border-brand-500/30 hover:bg-brand-500/30'
                      }`}
                  >
                    {copied ? '✓ Copied' : 'Copy'}
                  </button>
                </div>

                <button
                  onClick={goToRoom}
                  className="btn-ghost w-full mt-3 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  Enter Room
                </button>
              </div>
            )}
          </div>

          {/* Feature pills */}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {['🔒 AES Encrypted', '⚡ Real-time', '🖼 Image sharing', '📱 Mobile friendly'].map(f => (
              <span key={f} className="text-xs text-slate-400 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
                {f}
              </span>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard
