import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Nav() {
  const { profile, signOut } = useAuth()
  const { pathname } = useLocation()

  const links = [
    { to: '/tracker', label: 'My Album' },
    { to: '/friends', label: 'Friends' },
    { to: '/leaderboard', label: 'Leaderboard' },
  ]

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-3xl mx-auto px-4 flex items-center justify-between h-14">
        <Link to="/tracker" className="font-semibold text-gray-900 text-sm tracking-tight">
          Alboomy
        </Link>
        <nav className="flex items-center gap-1">
          {links.map(l => (
            <Link
              key={l.to}
              to={l.to}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                pathname === l.to
                  ? 'bg-gray-100 text-gray-900 font-medium'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {l.label}
            </Link>
          ))}
          <div className="ml-2 flex items-center gap-2">
            <Link to={`/u/${profile?.username}`} className="text-sm text-gray-500 hover:text-gray-900">
              @{profile?.username}
            </Link>
            <button
              onClick={signOut}
              className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 border border-gray-200 rounded"
            >
              Sign out
            </button>
          </div>
        </nav>
      </div>
    </header>
  )
}
