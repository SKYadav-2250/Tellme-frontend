const OnlineUsers = ({ users, currentUserId }) => {
  const getInitials = (name = '') =>
    name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)

  const getAvatarColor = (name = '') => {
    const colors = [
      'bg-violet-500',
      'bg-pink-500',
      'bg-amber-500',
      'bg-emerald-500',
      'bg-blue-500',
      'bg-rose-500',
      'bg-cyan-500',
      'bg-orange-500',
    ]
    let hash = 0
    for (const ch of name) hash = ch.charCodeAt(0) + ((hash << 5) - hash)
    return colors[Math.abs(hash) % colors.length]
  }

  return (
    <aside className="flex h-full w-full shrink-0 flex-col overflow-hidden bg-[#0b1326] text-[#dae2fd]">
      <div className="border-b border-white/10 px-5 py-4">
        <p className="text-lg font-semibold text-[#2dd4bf]">Room Members</p>
        <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-[#bacac5]">
          {users.length} online
        </p>
      </div>

      <ul className="flex-1 space-y-1 overflow-y-auto px-3 py-3">
        {users.length === 0 ? (
          <li className="rounded-2xl bg-white/5 px-4 py-3 text-sm text-[#bacac5]/70">
            No one here yet...
          </li>
        ) : (
          users.map((u) => (
            <li
              key={u.userId + u.socketId}
              className="mx-1 flex items-center gap-3 rounded-2xl bg-white/[0.03] px-3 py-3 transition-colors hover:bg-white/[0.06]"
            >
              <div className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${getAvatarColor(u.name)} text-xs font-bold text-white`}>
                {getInitials(u.name)}
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#0b1326] bg-[#57f1db]" />
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">
                  {u.name}
                  {u.userId === currentUserId && (
                    <span className="ml-1.5 text-xs text-[#57f1db]">(you)</span>
                  )}
                </p>
                <p className="text-xs text-[#bacac5]">online</p>
              </div>
            </li>
          ))
        )}
      </ul>
    </aside>
  )
}

export default OnlineUsers
