/**
 * OnlineUsers panel
 * Props:
 *   users  - Array<{ userId, name, email }>
 *   currentUserId - string
 */
const OnlineUsers = ({ users, currentUserId }) => {
  const getInitials = (name = '') =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  const getAvatarColor = (name = '') => {
    const colors = [
      'bg-violet-500', 'bg-pink-500', 'bg-amber-500',
      'bg-emerald-500', 'bg-blue-500', 'bg-rose-500',
      'bg-cyan-500', 'bg-orange-500',
    ]
    let hash = 0
    for (const ch of name) hash = ch.charCodeAt(0) + ((hash << 5) - hash)
    return colors[Math.abs(hash) % colors.length]
  }

  return (
    <aside className="w-64 shrink-0 glass-card flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse-dot" />
          <span className="text-sm font-semibold text-white">
            In this room ({users.length})
          </span>
        </div>
      </div>

      {/* User list */}
      <ul className="flex-1 overflow-y-auto py-2 space-y-1">
        {users.length === 0 ? (
          <li className="px-4 py-3 text-slate-500 text-sm">No one here yet…</li>
        ) : (
          users.map((u) => (
            <li
              key={u.userId + u.socketId}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl mx-2 hover:bg-white/5 transition-colors"
            >
              {/* Avatar */}
              <div className={`relative shrink-0 w-8 h-8 rounded-full ${getAvatarColor(u.name)} flex items-center justify-center text-white text-xs font-bold`}>
                {getInitials(u.name)}
                {/* Online dot */}
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-slate-900" />
              </div>

              {/* Name */}
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {u.name}
                  {u.userId === currentUserId && (
                    <span className="ml-1.5 text-xs text-brand-400">(you)</span>
                  )}
                </p>
                <p className="text-xs text-green-400">online</p>
              </div>
            </li>
          ))
        )}
      </ul>
    </aside>
  )
}

export default OnlineUsers
