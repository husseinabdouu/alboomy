import { useState, useRef, useEffect, useCallback } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { supabase } from '../lib/supabase'
import { Avatar } from './ui'

const NAV_LINKS = [
  { to: '/tracker', label: 'My Album', icon: '📖' },
  { to: '/friends', label: 'Friends', icon: '👥' },
  { to: '/messages', label: 'Messages', icon: '💬' },
  { to: '/groups', label: 'Groups', icon: '🏆' },
]

function DarkModeToggle() {
  const { dark, toggle } = useTheme()
  return (
    <button
      onClick={toggle}
      className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      aria-label="Toggle dark mode"
    >
      {dark ? (
        <svg className="w-4.5 h-4.5" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 7a5 5 0 100 10A5 5 0 0012 7z" />
        </svg>
      ) : (
        <svg className="w-4.5 h-4.5" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </button>
  )
}

function ProfileDropdown() {
  const { profile, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <Avatar name={profile?.display_name || profile?.username} src={profile?.avatar_url} size="sm" />
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 hidden sm:block max-w-[100px] truncate">
          {profile?.display_name || profile?.username}
        </span>
        <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-52 card shadow-modal py-1 z-50">
          <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3">
            <Avatar name={profile?.display_name || profile?.username} src={profile?.avatar_url} size="md" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                {profile?.display_name || profile?.username}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">@{profile?.username}</p>
            </div>
          </div>
          <button
            onClick={() => { navigate('/profile'); setOpen(false) }}
            className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            My Profile
          </button>
          <button
            onClick={() => { navigate(`/u/${profile?.username}`); setOpen(false) }}
            className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            Public Profile
          </button>
          <div className="border-t border-slate-100 dark:border-slate-700 mt-1 pt-1">
            <button
              onClick={signOut}
              className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Nav() {
  const { pathname } = useLocation()
  const { user } = useAuth()
  const [pendingRequestCount, setPendingRequestCount] = useState(0)
  const [unreadDMCount, setUnreadDMCount] = useState(0)

  const fetchPendingCount = useCallback(async () => {
    if (!user?.id) return
    const { count } = await supabase
      .from('friendships')
      .select('id', { count: 'exact', head: true })
      .eq('addressee_id', user.id)
      .eq('status', 'pending')
    setPendingRequestCount(count || 0)
  }, [user?.id])

  const fetchUnreadDMCount = useCallback(async () => {
    if (!user?.id) return
    const { count } = await supabase
      .from('direct_messages')
      .select('id', { count: 'exact', head: true })
      .eq('recipient_id', user.id)
      .is('read_at', null)
    setUnreadDMCount(count || 0)
  }, [user?.id])

  useEffect(() => {
    if (!user?.id) return

    fetchPendingCount()
    fetchUnreadDMCount()

    const friendChannel = supabase
      .channel(`friend-requests:${user.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'friendships',
        filter: `addressee_id=eq.${user.id}`,
      }, () => {
        fetchPendingCount()
      })
      .subscribe()

    const dmChannel = supabase
      .channel(`dm-unread:${user.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'direct_messages',
      }, payload => {
        const row = payload.eventType === 'DELETE' ? payload.old : payload.new
        if (row?.recipient_id === user.id) {
          fetchUnreadDMCount()
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(friendChannel)
      supabase.removeChannel(dmChannel)
    }
  }, [user?.id, fetchPendingCount, fetchUnreadDMCount])

  useEffect(() => {
    if (user?.id) fetchUnreadDMCount()
  }, [pathname, user?.id, fetchUnreadDMCount])

  function FriendsBadge() {
    if (pendingRequestCount <= 0) return null
    return (
      <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full leading-none">
        {pendingRequestCount > 9 ? '9+' : pendingRequestCount}
      </span>
    )
  }

  function MessagesBadge() {
    if (unreadDMCount <= 0) return null
    return (
      <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full leading-none">
        {unreadDMCount > 9 ? '9+' : unreadDMCount}
      </span>
    )
  }

  return (
    <>
      {/* Desktop/tablet top nav */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 flex items-center h-14 gap-6">
          {/* Logo */}
          <Link to="/tracker" className="font-bold text-lg text-brand-500 flex-shrink-0">
            Alboomy
          </Link>

          {/* Nav links */}
          <nav className="hidden sm:flex items-center gap-1 flex-1">
            {NAV_LINKS.map(l => (
              <Link
                key={l.to}
                to={l.to}
                className={`nav-link relative ${pathname.startsWith(l.to) ? 'active' : ''}`}
              >
                {l.label}
                {l.to === '/friends' && <FriendsBadge />}
                {l.to === '/messages' && <MessagesBadge />}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-1 ml-auto">
            <DarkModeToggle />
            <ProfileDropdown />
          </div>
        </div>
      </header>

      {/* Mobile bottom nav */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-1 flex">
        {[...NAV_LINKS, { to: '/profile', label: 'Profile', icon: '👤' }].map(l => {
          const active = pathname.startsWith(l.to)
          return (
            <Link
              key={l.to}
              to={l.to}
              className={`relative flex-1 flex flex-col items-center gap-0.5 py-2 rounded-lg transition-colors ${active ? 'text-brand-600 dark:text-brand-400' : 'text-slate-500 dark:text-slate-400'}`}
            >
              <span className="relative inline-flex">
                <span className="text-lg leading-none">{l.icon}</span>
                {l.to === '/friends' && <FriendsBadge />}
                {l.to === '/messages' && <MessagesBadge />}
              </span>
              <span className="text-[10px] font-medium">{l.label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
