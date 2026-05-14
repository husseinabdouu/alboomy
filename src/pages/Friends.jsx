import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export default function FriendsPage() {
  const { user } = useAuth()
  const [friends, setFriends] = useState([])
  const [pendingIn, setPendingIn] = useState([])
  const [pendingOut, setPendingOut] = useState([])
  const [search, setSearch] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState('')

  useEffect(() => { loadFriendships() }, [user])

  async function loadFriendships() {
    if (!user) return
    const { data } = await supabase
      .from('friendships')
      .select(`
        id, status, requester_id, addressee_id,
        requester:profiles!friendships_requester_id_fkey(id, username, display_name),
        addressee:profiles!friendships_addressee_id_fkey(id, username, display_name)
      `)
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)

    if (data) {
      setFriends(data.filter(f => f.status === 'accepted').map(f => f.requester_id === user.id ? f.addressee : f.requester))
      setPendingIn(data.filter(f => f.status === 'pending' && f.addressee_id === user.id).map(f => ({ ...f.requester, friendshipId: f.id })))
      setPendingOut(data.filter(f => f.status === 'pending' && f.requester_id === user.id).map(f => f.addressee))
    }
    setLoading(false)
  }

  async function searchUsers(q) {
    if (!q.trim()) { setSearchResults([]); return }
    setSearching(true)
    const { data } = await supabase
      .from('profiles')
      .select('id, username, display_name')
      .ilike('username', `%${q}%`)
      .neq('id', user.id)
      .limit(10)
    setSearchResults(data || [])
    setSearching(false)
  }

  async function sendRequest(addresseeId) {
    setActionLoading(addresseeId)
    const { error } = await supabase.from('friendships').insert({ requester_id: user.id, addressee_id: addresseeId })
    if (!error) { await loadFriendships(); setSearch(''); setSearchResults([]) }
    setActionLoading('')
  }

  async function respondToRequest(friendshipId, accept) {
    setActionLoading(friendshipId)
    if (accept) {
      await supabase.from('friendships').update({ status: 'accepted' }).eq('id', friendshipId)
    } else {
      await supabase.from('friendships').delete().eq('id', friendshipId)
    }
    await loadFriendships()
    setActionLoading('')
  }

  async function removeFriend(friendId) {
    if (!confirm('Remove this friend?')) return
    await supabase.from('friendships').delete()
      .or(`and(requester_id.eq.${user.id},addressee_id.eq.${friendId}),and(requester_id.eq.${friendId},addressee_id.eq.${user.id})`)
    await loadFriendships()
  }

  // Check if a user already has a pending/accepted relationship
  function getRelationship(targetId) {
    if (friends.find(f => f.id === targetId)) return 'friends'
    if (pendingOut.find(f => f.id === targetId)) return 'pending'
    if (pendingIn.find(f => f.id === targetId)) return 'incoming'
    return null
  }

  if (loading) return <div className="py-12 text-center text-gray-400 text-sm">Loading…</div>

  return (
    <div className="pt-6">
      <h1 className="text-xl font-semibold text-gray-900 mb-5">Friends</h1>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          value={search}
          onChange={e => { setSearch(e.target.value); searchUsers(e.target.value) }}
          placeholder="Search by username to add friends…"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        {searchResults.length > 0 && (
          <div className="mt-2 bg-white border border-gray-200 rounded-xl overflow-hidden">
            {searchResults.map((u, i) => {
              const rel = getRelationship(u.id)
              return (
                <div key={u.id} className={`flex items-center gap-3 px-4 py-3 ${i < searchResults.length - 1 ? 'border-b border-gray-100' : ''}`}>
                  <div className="flex-1">
                    <div className="text-sm font-medium">@{u.username}</div>
                    {u.display_name && <div className="text-xs text-gray-500">{u.display_name}</div>}
                  </div>
                  {rel === 'friends' && <span className="text-xs text-green-600">Friends ✓</span>}
                  {rel === 'pending' && <span className="text-xs text-gray-400">Sent</span>}
                  {rel === 'incoming' && <span className="text-xs text-amber-600">Incoming</span>}
                  {rel === null && (
                    <button
                      onClick={() => sendRequest(u.id)}
                      disabled={actionLoading === u.id}
                      className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60"
                    >
                      {actionLoading === u.id ? '…' : 'Add'}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
        {search && !searching && searchResults.length === 0 && (
          <p className="text-sm text-gray-400 mt-2 px-1">No users found for "{search}"</p>
        )}
      </div>

      {/* Incoming requests */}
      {pendingIn.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Friend requests ({pendingIn.length})</h2>
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            {pendingIn.map((u, i) => (
              <div key={u.id} className={`flex items-center gap-3 px-4 py-3 ${i < pendingIn.length - 1 ? 'border-b border-gray-100' : ''}`}>
                <div className="flex-1">
                  <div className="text-sm font-medium">@{u.username}</div>
                  {u.display_name && <div className="text-xs text-gray-500">{u.display_name}</div>}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => respondToRequest(u.friendshipId, true)}
                    disabled={actionLoading === u.friendshipId}
                    className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => respondToRequest(u.friendshipId, false)}
                    className="text-xs border border-gray-200 hover:bg-gray-50 text-gray-600 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Friends list */}
      <div>
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          {friends.length > 0 ? `Friends (${friends.length})` : 'No friends yet'}
        </h2>
        {friends.length === 0 && (
          <p className="text-sm text-gray-400">Search for friends by username above.</p>
        )}
        {friends.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            {friends.map((f, i) => (
              <div key={f.id} className={`flex items-center gap-3 px-4 py-3 ${i < friends.length - 1 ? 'border-b border-gray-100' : ''}`}>
                <div className="flex-1">
                  <Link to={`/u/${f.username}`} className="text-sm font-medium hover:text-green-600 transition-colors">
                    @{f.username}
                  </Link>
                  {f.display_name && <div className="text-xs text-gray-500">{f.display_name}</div>}
                </div>
                <div className="flex gap-2 items-center">
                  <Link to={`/u/${f.username}`} className="text-xs text-green-600 hover:text-green-700 font-medium">
                    View album →
                  </Link>
                  <button
                    onClick={() => removeFriend(f.id)}
                    className="text-xs text-gray-300 hover:text-red-400 transition-colors ml-2"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pending outgoing */}
      {pendingOut.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Pending sent ({pendingOut.length})</h2>
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            {pendingOut.map((u, i) => (
              <div key={u.id} className={`flex items-center gap-3 px-4 py-3 ${i < pendingOut.length - 1 ? 'border-b border-gray-100' : ''}`}>
                <span className="flex-1 text-sm text-gray-500">@{u.username}</span>
                <span className="text-xs text-gray-300">Awaiting response</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
