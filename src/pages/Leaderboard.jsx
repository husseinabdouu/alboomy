import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { TOTAL_STICKERS } from '../lib/stickers'

export default function LeaderboardPage() {
  const { user } = useAuth()
  const [mode, setMode] = useState('global') // 'global' | 'friends'
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadLeaderboard() }, [mode, user])

  async function loadLeaderboard() {
    setLoading(true)

    if (mode === 'global') {
      const { data } = await supabase
        .from('leaderboard_view')
        .select('*')
        .limit(50)
      setEntries(data || [])
    } else {
      // Friends leaderboard: own entry + accepted friends
      const { data: friendships } = await supabase
        .from('friendships')
        .select('requester_id, addressee_id')
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
        .eq('status', 'accepted')

      const friendIds = friendships?.map(f => f.requester_id === user.id ? f.addressee_id : f.requester_id) || []
      const ids = [user.id, ...friendIds]

      const { data } = await supabase
        .from('leaderboard_view')
        .select('*')
        .in('id', ids)
        .order('total_collected', { ascending: false })

      setEntries(data || [])
    }
    setLoading(false)
  }

  function medalFor(rank) {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return null
  }

  return (
    <div className="pt-6">
      <h1 className="text-xl font-semibold text-gray-900 mb-4">Leaderboard</h1>

      <div className="flex rounded-lg bg-gray-100 p-1 mb-6 w-fit">
        {['global', 'friends'].map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-4 py-1.5 text-sm rounded-md transition-colors capitalize ${mode === m ? 'bg-white shadow-sm font-medium text-gray-900' : 'text-gray-500'}`}
          >
            {m}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400 text-sm">Loading…</div>
      ) : entries.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-sm">
            {mode === 'friends' ? 'Add friends to see a friends leaderboard.' : 'No entries yet.'}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {entries.map((entry, i) => {
            const rank = i + 1
            const isMe = entry.id === user?.id
            const pct = Math.round((entry.total_collected / TOTAL_STICKERS) * 100)
            const medal = medalFor(rank)

            return (
              <div
                key={entry.id}
                className={`flex items-center gap-3 px-4 py-3 ${i < entries.length - 1 ? 'border-b border-gray-100' : ''} ${isMe ? 'bg-green-50' : ''}`}
              >
                <div className="w-8 text-center">
                  {medal ? (
                    <span className="text-lg">{medal}</span>
                  ) : (
                    <span className="text-sm text-gray-400 font-medium">{rank}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Link to={`/u/${entry.username}`} className={`text-sm font-medium hover:text-green-600 transition-colors ${isMe ? 'text-green-700' : 'text-gray-800'}`}>
                    @{entry.username}
                    {isMe && <span className="ml-1.5 text-xs text-green-500 font-normal">you</span>}
                  </Link>
                  {entry.display_name && entry.display_name !== entry.username && (
                    <div className="text-xs text-gray-400 truncate">{entry.display_name}</div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <div className="hidden sm:block w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-800">{entry.total_collected}</div>
                    <div className="text-xs text-gray-400">{pct}%</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
