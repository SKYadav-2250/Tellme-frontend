import { decryptMessage } from '../utils/crypto'

/**
 * MessageBubble
 * Props:
 *   message   - { id, senderId, senderName, encryptedText, imageData, type, timestamp }
 *   isOwn     - boolean (current user's message)
 *   roomId    - string (needed to decrypt)
 */
const MessageBubble = ({ message, isOwn, roomId }) => {
  const time = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })

  const decryptedText =
    message.type === 'text' && message.encryptedText
      ? decryptMessage(message.encryptedText, roomId)
      : null

  const getInitials = (name = '') =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  const getAvatarColor = (name = '') => {
    const colors = [
      'from-violet-500 to-purple-600',
      'from-pink-500 to-rose-600',
      'from-amber-400 to-orange-500',
      'from-emerald-400 to-teal-500',
      'from-sky-400 to-blue-500',
      'from-cyan-400 to-brand-500',
    ]
    let hash = 0
    for (const ch of name) hash = ch.charCodeAt(0) + ((hash << 5) - hash)
    return colors[Math.abs(hash) % colors.length]
  }

  return (
    <div className={`flex items-end gap-2 animate-slide-up ${isOwn ? 'justify-end' : 'justify-start'}`}>

      {/* Other's avatar */}
      {!isOwn && (
        <div className={`shrink-0 w-7 h-7 rounded-full bg-gradient-to-br ${getAvatarColor(message.senderName)}
                         flex items-center justify-center text-white text-[10px] font-bold mb-1 shadow-lg`}>
          {getInitials(message.senderName)}
        </div>
      )}

      <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[75%] sm:max-w-sm md:max-w-md`}>
        {/* Sender name (others only) */}
        {!isOwn && (
          <span className="text-[11px] text-brand-400 font-semibold mb-1 ml-1 tracking-wide">
            {message.senderName}
          </span>
        )}

        {/* Bubble */}
        {message.type === 'image' ? (
          <div className={`rounded-2xl overflow-hidden shadow-xl border
            ${isOwn
              ? 'rounded-br-sm border-brand-500/30'
              : 'rounded-bl-sm border-white/10'
            }`}
          >
            <img
              src={message.imageData}
              alt="Shared image"
              className="block max-w-full max-h-64 object-contain cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => window.open(message.imageData, '_blank')}
            />
          </div>
        ) : (
          <div
            className={`px-4 py-2.5 shadow-lg
              ${isOwn
                ? 'bg-gradient-to-br from-brand-600 to-teal-600 text-white rounded-2xl rounded-br-sm'
                : 'bg-white/10 border border-white/10 text-slate-100 rounded-2xl rounded-bl-sm backdrop-blur-sm'
              }`}
          >
            <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
              {decryptedText || <span className="text-red-400 text-xs italic">⚠ decrypt failed</span>}
            </p>
          </div>
        )}

        {/* Timestamp */}
        <span className="text-[10px] text-slate-500 mt-1 mx-1">{time}</span>
      </div>

      {/* Own avatar */}
      {isOwn && (
        <div className={`shrink-0 w-7 h-7 rounded-full bg-gradient-to-br ${getAvatarColor(message.senderName)}
                         flex items-center justify-center text-white text-[10px] font-bold mb-1 shadow-lg`}>
          {getInitials(message.senderName)}
        </div>
      )}
    </div>
  )
}

export default MessageBubble
