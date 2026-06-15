import { useState } from 'react'

// ── Avatar ────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  'bg-brand-500', 'bg-emerald-500', 'bg-amber-500',
  'bg-rose-500', 'bg-cyan-500', 'bg-violet-500',
  'bg-orange-500', 'bg-teal-500',
]

function colorForString(str) {
  if (!str) return AVATAR_COLORS[0]
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

export function Avatar({ name, src, size = 'md', className = '' }) {
  const initials = (name || '?').slice(0, 2).toUpperCase()
  const color = colorForString(name)
  const sizes = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-12 h-12 text-base', xl: 'w-16 h-16 text-xl' }
  if (src) {
    return (
      <img
        src={src}
        alt={name || 'avatar'}
        className={`rounded-full object-cover flex-shrink-0 ${sizes[size]} ${className}`}
      />
    )
  }
  return (
    <div className={`avatar ${color} ${sizes[size]} ${className}`}>
      {initials}
    </div>
  )
}

// ── Progress bar ─────────────────────────────────────────────────
export function ProgressBar({ value, max, className = '', size = 'md' }) {
  const pct = max > 0 ? Math.min(100, Math.round(value / max * 100)) : 0
  const heights = { sm: 'h-1', md: 'h-1.5', lg: 'h-2' }
  return (
    <div className={`progress-track ${heights[size]} ${className}`}>
      <div className={`progress-fill ${heights[size]}`} style={{ width: `${pct}%` }} />
    </div>
  )
}

// ── Empty state ───────────────────────────────────────────────────
export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="text-center py-14 px-6">
      {icon && <div className="text-4xl mb-4">{icon}</div>}
      <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1">{title}</h3>
      {description && <p className="text-sm text-slate-500 dark:text-slate-400 mb-5 max-w-xs mx-auto">{description}</p>}
      {action}
    </div>
  )
}

// ── Spinner ───────────────────────────────────────────────────────
export function Spinner({ size = 'md' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' }
  return (
    <div className={`${sizes[size]} animate-spin rounded-full border-2 border-slate-200 dark:border-slate-700 border-t-brand-500`} />
  )
}

// ── Page loading ──────────────────────────────────────────────────
export function PageLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <Spinner size="lg" />
    </div>
  )
}

// ── Stat card ─────────────────────────────────────────────────────
export function StatCard({ value, label, color = 'default', sublabel }) {
  const colors = {
    default: 'text-slate-900 dark:text-white',
    brand: 'text-brand-600 dark:text-brand-400',
    green: 'text-emerald-600 dark:text-emerald-400',
    red: 'text-red-500 dark:text-red-400',
    amber: 'text-amber-600 dark:text-amber-400',
  }
  return (
    <div className="card p-5">
      <div className={`text-3xl font-bold ${colors[color]}`}>{value}</div>
      <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">{label}</div>
      {sublabel && <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{sublabel}</div>}
    </div>
  )
}

// ── Toast notification ────────────────────────────────────────────
export function Toast({ message, visible }) {
  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-200 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
      <div className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-sm font-medium px-4 py-2.5 rounded-full shadow-modal whitespace-nowrap">
        {message}
      </div>
    </div>
  )
}

// ── Medal ─────────────────────────────────────────────────────────
export function Medal({ rank }) {
  if (rank === 1) return <span className="text-lg">🥇</span>
  if (rank === 2) return <span className="text-lg">🥈</span>
  if (rank === 3) return <span className="text-lg">🥉</span>
  return <span className="text-sm font-bold text-slate-400 dark:text-slate-500 w-6 text-center">{rank}</span>
}

// ── Invite code display ───────────────────────────────────────────
export function InviteCode({ code, url }) {
  const [copied, setCopied] = useState(false)
  
  async function copy(text) {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-slate-100 dark:bg-slate-700 rounded-lg px-4 py-2.5 font-mono text-lg font-bold tracking-widest text-slate-900 dark:text-white text-center">
          {code}
        </div>
        <button onClick={() => copy(code)} className="btn-secondary px-3 py-2.5 text-xs">
          {copied ? 'Copied!' : 'Copy code'}
        </button>
      </div>
      <button onClick={() => copy(url)} className="w-full text-xs text-brand-600 dark:text-brand-400 hover:underline text-center">
        Or copy invite link
      </button>
    </div>
  )
}

export function ImageLightbox({ src, alt, onClose }) {
  if (!src) return null
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white">
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <img
        src={src}
        alt={alt || 'Profile picture'}
        className="max-w-full max-h-full rounded-2xl object-contain"
        onClick={e => e.stopPropagation()}
      />
    </div>
  )
}

