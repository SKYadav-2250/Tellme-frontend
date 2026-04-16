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
    <div className="relative min-h-screen bg-[#050505] text-white">
      {/* Background gradient */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(45,212,191,0.08),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(45,212,191,0.04),transparent_35%)]" />
      </div>

      {/* Header/Nav */}
      <header className="relative z-10 border-b border-white/5 bg-black/40 backdrop-blur-md">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#2dd4bf]/20 bg-[#2dd4bf]/10">
              <svg className="h-5 w-5 text-[#2dd4bf]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-[#2dd4bf] to-[#57f1db] bg-clip-text text-transparent">
              TellMe
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="hidden sm:flex flex-col items-end">
                  <p className="text-sm font-medium text-white">
                    {user?.name}
                  </p>
                  <p className="text-xs text-[#bacac5]">Online</p>
                </div>
                <button
                  onClick={logout}
                  className="rounded-lg border border-[#2dd4bf]/20 bg-[#2dd4bf]/10 px-4 py-2 text-sm font-medium text-[#2dd4bf] hover:bg-[#2dd4bf]/20 transition-colors"
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link
                to={`/login?redirect=${encodeURIComponent(location.pathname + location.search || '/dashboard')}`}
                className="rounded-lg border border-[#2dd4bf]/20 bg-[#2dd4bf]/10 px-4 py-2 text-sm font-medium text-[#2dd4bf] hover:bg-[#2dd4bf]/20 transition-colors"
              >
                Sign in
              </Link>
            )}
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#2dd4bf]/20 bg-[#2dd4bf]/10 px-4 py-2 mb-6">
            <span className="h-2 w-2 rounded-full bg-[#2dd4bf] animate-pulse" />
            <span className="text-sm font-medium text-[#2dd4bf]">Encrypted Private Rooms</span>
          </div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
            <span className="block text-white">Private Chat That</span>
            <span className="block bg-gradient-to-r from-[#2dd4bf] via-[#57f1db] to-[#62fae3] bg-clip-text text-transparent">
              Respects Your Privacy
            </span>
          </h2>

          <p className="mx-auto max-w-2xl text-lg text-[#bacac5] mb-8 leading-relaxed">
            Create a secure room, share the link, and start chatting instantly. 
            No registration required for guests. AES-256 encryption on every message.
          </p>

          <div className="flex flex-wrap gap-3 justify-center mb-8">
            {[
              { icon: '🔒', label: 'AES Encrypted' },
              { icon: '⚡', label: 'Real-time' },
              { icon: '📱', label: 'Mobile Ready' },
              { icon: '🎨', label: 'Dark Theme' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2">
                <span className="text-lg">{item.icon}</span>
                <span className="text-sm text-white">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Room Creation Card */}
        <div className="mx-auto max-w-2xl mb-12">
          {redirectTarget && !user && (
            <div className="mb-6 rounded-2xl border border-orange-500/20 bg-orange-500/10 p-4">
              <p className="text-sm text-orange-200 mb-3">
                📍 You were trying to open a room. Please sign in to continue.
              </p>
              <Link
                to={`/login?redirect=${encodeURIComponent(redirectTarget)}`}
                className="inline-flex rounded-lg border border-orange-500/20 bg-orange-500/20 hover:bg-orange-500/30 px-4 py-2 text-sm font-medium text-orange-200 transition-colors"
              >
                Sign in to join
              </Link>
            </div>
          )}

          <div className="rounded-2xl border border-[#2dd4bf]/20 bg-gradient-to-br from-[#0f2235] to-[#051420] p-8 sm:p-10 shadow-[0_20px_60px_rgba(45,212,191,0.1)]">
            <div className="mb-8">
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                Start a Room
              </h3>
              <p className="text-[#bacac5]">
                One click to create. Share the link with anyone. No setup needed.
              </p>
            </div>

            <button
              onClick={createRoom}
              className="w-full rounded-xl bg-gradient-to-r from-[#2dd4bf] to-[#57f1db] hover:from-[#57f1db] hover:to-[#62fae3] text-white font-bold py-4 px-6 transition-all active:scale-95 shadow-[0_10px_30px_rgba(45,212,191,0.3)] flex items-center justify-center gap-2 mb-6"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create New Room
            </button>

            {/* Room Link Display */}
            {roomLink ? (
              <div className="space-y-4 rounded-xl border border-white/10 bg-black/50 p-6">
                <div>
                  <p className="text-sm text-[#bacac5] mb-2">Your room link:</p>
                  <div className="rounded-lg border border-white/10 bg-black p-4">
                    <p className="font-mono text-sm text-[#57f1db] break-all">{roomLink}</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={copyLink}
                    className={`flex-1 rounded-lg py-3 px-4 font-medium transition-all ${
                      copied
                        ? 'border border-green-500/30 bg-green-500/10 text-green-300'
                        : 'border border-[#2dd4bf]/20 bg-[#2dd4bf]/10 text-[#2dd4bf] hover:bg-[#2dd4bf]/20'
                    }`}
                  >
                    {copied ? '✓ Copied' : '📋 Copy Link'}
                  </button>
                  <button
                    onClick={goToRoom}
                    className="flex-1 rounded-lg py-3 px-4 font-medium border border-[#2dd4bf]/20 bg-[#2dd4bf]/10 text-[#2dd4bf] hover:bg-[#2dd4bf]/20 transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                    Enter Room
                  </button>
                </div>

                <p className="text-xs text-[#bacac5] text-center">
                  Share this link with anyone to invite them to your private room
                </p>
              </div>
            ) : (
              <p className="text-sm text-[#bacac5] text-center py-6 border-t border-white/10">
                Click "Create New Room" to generate a shareable link
              </p>
            )}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: 'Lightning Fast',
              description: 'Real-time messages with WebSocket technology. No delays.',
              icon: '⚡',
            },
            {
              title: 'Secure & Private',
              description: 'End-to-end AES-256 encryption. No server-side storage.',
              icon: '🔒',
            },
            {
              title: 'Share Images',
              description: 'Send encrypted images directly in the chat. Up to 5MB.',
              icon: '🖼️',
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-white/10 bg-white/5 p-6 hover:bg-white/[0.08] transition-colors"
            >
              <div className="text-3xl mb-3">{feature.icon}</div>
              <h3 className="font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-[#bacac5]">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* How It Works */}
        <div className="mt-16 rounded-2xl border border-white/10 bg-white/[0.02] p-8">
          <h3 className="text-2xl font-bold text-white mb-8 text-center">How It Works</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { num: '1', title: 'Create', desc: 'Click create room button' },
              { num: '2', title: 'Share', desc: 'Copy and send the link' },
              { num: '3', title: 'Chat', desc: 'Start messaging instantly' },
            ].map((step) => (
              <div key={step.num} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-[#2dd4bf]/20 bg-[#2dd4bf]/10 text-[#2dd4bf] font-bold">
                  {step.num}
                </div>
                <h4 className="font-bold text-white mb-2">{step.title}</h4>
                <p className="text-sm text-[#bacac5]">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 bg-black/40 mt-20 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center text-sm text-[#bacac5]">
          <p>© 2024 TellMe. Secure private rooms built for focus.</p>
        </div>
      </footer>
    </div>
  )
}

export default Dashboard
