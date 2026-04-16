import { decryptMessage } from '../utils/crypto'

const formatTime = (timestamp) => {
  const parsed = new Date(timestamp)
  if (Number.isNaN(parsed.getTime())) return ''

  return parsed.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  })
}

const formatFileSize = (dataUrl = '') => {
  if (!dataUrl.startsWith('data:')) return ''
  const base64 = dataUrl.split(',')[1] || ''
  const bytes = Math.round((base64.length * 3) / 4)
  if (!bytes) return ''
  const mb = bytes / (1024 * 1024)
  if (mb >= 1) return `${mb.toFixed(1)} MB`
  const kb = bytes / 1024
  return `${Math.max(1, Math.round(kb))} KB`
}

const getInitials = (name = '') =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

const getAvatarTone = (name = '') => {
  const colors = [
    'bg-[#2a3347]',
    'bg-[#31405f]',
    'bg-[#25444a]',
    'bg-[#3f3a58]',
    'bg-[#2f4751]',
    'bg-[#3a3847]',
  ]
  let hash = 0
  for (const ch of name) hash = ch.charCodeAt(0) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

const CheckIcon = () => (
  <svg className="h-[14px] w-[14px] text-[#57f1db]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M5 13l4 4L19 7" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M10 13l4 4L24 7" />
  </svg>
)

const MessageBubble = ({ message, isOwn, roomId }) => {
  const time = formatTime(message.timestamp)
  const decryptedText =
    message.type === 'text' && message.encryptedText
      ? decryptMessage(message.encryptedText, roomId)
      : ''

  const fallbackText = message.type === 'text' ? message.text || message.content || '' : ''
  const displayText =
    decryptedText && decryptedText !== '[decryption failed]'
      ? decryptedText
      : fallbackText

  if (isOwn) {
    return (
      <div className="ml-auto flex max-w-[85%] items-end justify-end gap-3 md:max-w-[60%]">
        <div className="flex w-full flex-col items-end gap-1">
          {message.type === 'image' ? (
            <div className="overflow-hidden rounded-xl rounded-br-sm bg-[#2dd4bf] p-1 shadow-[0_8px_30px_rgba(45,212,191,0.2)]">
              <div className="overflow-hidden rounded-lg">
                <img
                  src={message.imageData}
                  alt="Shared image"
                  className="block max-h-72 w-full object-cover"
                  onClick={() => window.open(message.imageData, '_blank', 'noopener,noreferrer')}
                />
              </div>
              <div className="px-4 py-3 text-[#00574d]">
                <p className="text-sm font-medium">Shared image</p>
                <p className="text-[10px] opacity-70">{formatFileSize(message.imageData)}</p>
              </div>
            </div>
          ) : (
            <div className="rounded-xl rounded-br-sm bg-[#2dd4bf] px-6 py-3 text-[#00574d] shadow-[0_4px_20px_rgba(45,212,191,0.15)]">
              <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
                {displayText || <span className="italic opacity-70">Message unavailable</span>}
              </p>
            </div>
          )}

          <div className="mr-2 flex items-center gap-1">
            {time && <span className="text-[10px] text-[#bacac5]/60">{time}</span>}
            <CheckIcon />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex max-w-[85%] items-end gap-3 md:max-w-[60%]">
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${getAvatarTone(message.senderName)} text-[11px] font-semibold text-[#dae2fd]`}>
        {getInitials(message.senderName)}
      </div>

      <div className="flex flex-col gap-1">
        <span className="ml-2 text-xs font-medium text-[#bacac5]">{message.senderName}</span>

        {message.type === 'image' ? (
          <div className="overflow-hidden rounded-xl rounded-bl-sm bg-[#2d3449] text-[#dae2fd]">
            <img
              src={message.imageData}
              alt="Shared image"
              className="block max-h-72 w-full object-cover"
              onClick={() => window.open(message.imageData, '_blank', 'noopener,noreferrer')}
            />
            <div className="px-4 py-3">
              <p className="text-sm font-medium">Shared image</p>
              <p className="text-[10px] text-[#bacac5]/60">{formatFileSize(message.imageData)}</p>
            </div>
          </div>
        ) : (
          <div className="rounded-xl rounded-bl-sm bg-[#2d3449] px-6 py-3 text-[#dae2fd]">
            <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
              {displayText || <span className="italic text-[#bacac5]/70">Message unavailable</span>}
            </p>
          </div>
        )}

        {time && <span className="ml-2 text-[10px] text-[#bacac5]/60">{time}</span>}
      </div>
    </div>
  )
}

export default MessageBubble
