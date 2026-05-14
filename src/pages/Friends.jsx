import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Avatar, ProgressBar, EmptyState, PageLoader, Toast, Spinner } from '../components/ui'
import { TOTAL_STICKERS, ALL_STICKERS } from '../lib/stickers'

function SwapModal({ myUserId, friendProfile, onClose }) {
  const [myCollection, setMyCollection] = useState(new Set())
  const [friendCollection, setFriendCollection] = useState(new Set())
  const [myDuplicates, setMyDuplicates] = useState([])
  const [friendDuplicates, setFriendDuplicates] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('they_need') // they_need | i_need | propose

  useEffect(() => {
    async function load() {
      const [myCol, friendCol, myDups, friendDups] = await Promise.all([
        supabase.from('collections').select('sticker_id').eq('user_id', myUserId),
        supabase.from('collections').select('sticker_id').eq('user_id', friendProfile.id),
        supabase.from('duplicates').select('*').eq('user_id', myUserId),
        supabase.from('duplicates').select('*').eq('user_id', friendProfile.id),
      ])
      setMyCollection(new Set(myCol.data?.map(r => r.sticker_id) || []))
      setFriendCollection(new Set(friendCol.data?.map(r => r.sticker_id) || []))
      setMyDuplicates(myDups.data || [])
      setFriendDuplicates(friendDups.data || [])
      setLoading(false)
    }
    load()
  }, [myUserId, friendProfile.id])

  // Stickers I have duplicates of that they don't have
  const iCanGiveThem = myDuplicates
    .filter(d => !friendCollection.has(d.sticker_id))
    .map(d => ALL_STICKERS.find(s => s.id === d.sticker_id))
    .filter(Boolean)

  // Stickers they have duplicates of that I don't have
  const theyCanGiveMe = friendDuplicates
    .filter(d => !myCollection.has(d.sticker_id))
    .map(d => ALL_STICKERS.find(s => s.id === d.sticker_id))
    .filter(Boolean)

  function StickerRow({ sticker }) {
    return (
      <div className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg">
        <span className="text-xs font-bold text-brand-500 w-14 flex-shrink-0">{sticker.id}</span>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{sticker.label}</div>
          <div className="text-xs text-slate-400">{sticker.flag} {sticker.team}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="card w-full max-w-md max-h-[80vh] flex flex-col shadow-modal">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-700">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">Swap check</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">with @{friendProfile.username}</p>
          </div>
          <button onClick={onClose} className="btn-ghost p-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex border-b border-slate-100 dark:border-slate-700 px-2">
          {[
            ['they_need', `They need (${iCanGiveThem.length})`],
            ['i_need', `I need (${theyCanGiveMe.length})`],
          ].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 px-3 py-2.5 text-xs font-medium transition-colors border-b-2 -mb-px ${
                activeTab === id ? 'border-brand-500 text-brand-600 dark:text-brand-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {loading ? (
            <div className="flex justify-center py-8"><Spinner /></div>
          ) : activeTab === 'they_need' ? (
            iCanGiveThem.length === 0 ? (
              <EmptyState icon="🤷" title="No matches" description="You don't have any duplicates they need right now" />
            ) : (
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 px-4 py-2">Your duplicates that {friendProfile.display_name || friendProfile.username} needs:</p>
                {iCanGiveThem.map(s => <StickerRow key={s.id} sticker={s} />)}
              </div>
            )
          ) : (
            theyCanGiveMe.length === 0 ? (
              <EmptyState icon="🤷" title="No matches" description={`${friendProfile.display_name || friendProfile.username} doesn't have any duplicates you need`} />
            ) : (
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 px-4 py-2">Their duplicates that you need:</p>
                {theyCanGiveMe.map(s => <StickerRow key={s.id} sticker={s} />)}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}

function FriendCard({ friend, myUserId, onRemove }) {
  const [progress, setProgress] = useState(null)
  const [swapOpen, setSwapOpen] = useState(false)

  useEffect(() => {
    supabase.from('collections').select('sticker_id', { count: 'exact', head: true }).eq('user_id', friend.id)
      .then(({ count }) => setProgress(count || 0))
  }, [friend.id])

  const pct = progress !== null ? Math.round(progress / TOTAL_STICKERS * 100) : null

  return (
    <>
      <div className="card p-4 flex items-center gap-3">
        <Avatar name={friend.display_name || friend.username} size="md" />
        <div className="flex-1 min-w-0">
          <Link to={`/u/${friend.username}`} className="text-sm font-semibold text-slate-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
            {friend.display_name || friend.username}
          </Link>
          <p className="text-xs text-slate-400 dark:text-slate-500">@{friend.username}</p>
          {pct !== null && (
            <div className="flex items-center gap-2 mt-1.5">
              <ProgressBar value={progress} max={TOTAL_STICKERS} className="flex-1" size="sm" />
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{pct}%</span>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <button
            onClick={() => setSwapOpen(true)}
            className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 bg-brand-50 dark:bg-brand-950 hover:bg-brand-100 dark:hover:bg-brand-900 px-3 py-1.5 rounded-lg transition-colors"
          >
            🔄 Swaps
          </button>
          <Link
            to={`/u/${friend.username}`}
            className="text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3 py-1.5 rounded-lg text-center transition-colors"
          >
            View album
          </Link>
        </div>
      </div>
      {swapOpen && (
        <SwapModal myUserId={myUserId} friendProfile={friend} onClose={() => setSwapOpen(false)} />
      )}
    </>
  )
}

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
  const [toast, setToast] = useState({ msg: '', show: false })

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
    const { data } = await supabase.from('profiles').select('id, username, display_name').ilike('username', `%${q}%`).neq('id', user.id).limit(8)
    setSearchResults(data || [])
    setSearching(false)
  }

  function getRelationship(id) {
    if (friends.find(f => f.id === id)) return 'friends'
    if (pendingOut.find(f => f.id === id)) return 'pending'
    if (pendingIn.find(f => f.id === id)) return 'incoming'
    return null
  }

  async function sendRequest(addresseeId) {
    setActionLoading(addresseeId)
    await supabase.from('friendships').insert({ requester_id: user.id, addressee_id: addresseeId })
    await loadFriendships()
    setSearch(''); setSearchResults([])
    setActionLoading('')
    setToast({ msg: 'Friend request sent!', show: true })
    setTimeout(() => setToast(t => ({ ...t, show: false })), 2000)
  }

  async function respond(friendshipId, accept) {
    setActionLoading(friendshipId)
    if (accept) await supabase.from('friendships').update({ status: 'accepted' }).eq('id', friendshipId)
    else await supabase.from('friendships').delete().eq('id', friendshipId)
    await loadFriendships()
    setActionLoading('')
  }

  async function removeFriend(friendId) {
    if (!confirm('Remove this friend?')) return
    await supabase.from('friendships').delete()
      .or(`and(requester_id.eq.${user.id},addressee_id.eq.${friendId}),and(requester_id.eq.${friendId},addressee_id.eq.${user.id})`)
    await loadFriendships()
  }

  if (loading) return <PageLoader />

  return (
    <div className="pb-20 sm:pb-0">
      <div className="page-header">
        <h1 className="page-title">Friends</h1>
        <p className="page-subtitle">Connect, compare, and trade stickers</p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); searchUsers(e.target.value) }}
            placeholder="Search by username to add friends…"
            className="input pl-10"
          />
        </div>
        {searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 card shadow-modal py-1 z-20">
            {searchResults.map(u => {
              const rel = getRelationship(u.id)
              return (
                <div key={u.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                  <Avatar name={u.display_name || u.username} size="sm" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-slate-900 dark:text-white">@{u.username}</div>
                    {u.display_name && <div className="text-xs text-slate-400">{u.display_name}</div>}
                  </div>
                  {rel === 'friends' && <span className="badge-green">Friends</span>}
                  {rel === 'pending' && <span className="badge-slate">Sent</span>}
                  {rel === 'incoming' && <span className="badge-amber">Incoming</span>}
                  {rel === null && (
                    <button onClick={() => sendRequest(u.id)} disabled={actionLoading === u.id} className="btn-primary px-3 py-1.5 text-xs">
                      {actionLoading === u.id ? '…' : 'Add'}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
        {search && !searching && searchResults.length === 0 && (
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-2 px-1">No users found for "{search}"</p>
        )}
      </div>

      {/* Pending incoming */}
      {pendingIn.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
            Friend requests · {pendingIn.length}
          </h2>
          <div className="space-y-2">
            {pendingIn.map(u => (
              <div key={u.id} className="card p-4 flex items-center gap-3">
                <Avatar name={u.display_name || u.username} size="md" />
                <div className="flex-1">
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">@{u.username}</div>
                  {u.display_name && <div className="text-xs text-slate-400">{u.display_name}</div>}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => respond(u.friendshipId, true)} disabled={actionLoading === u.friendshipId} className="btn-primary px-3 py-1.5 text-xs">Accept</button>
                  <button onClick={() => respond(u.friendshipId, false)} className="btn-secondary px-3 py-1.5 text-xs">Decline</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Friends list */}
      <div>
        <h2 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
          Friends · {friends.length}
        </h2>
        {friends.length === 0 ? (
          <EmptyState icon="👥" title="No friends yet" description="Search for people by username and send them a friend request" />
        ) : (
          <div className="space-y-2">
            {friends.map(f => (
              <FriendCard key={f.id} friend={f} myUserId={user.id} onRemove={() => removeFriend(f.id)} />
            ))}
          </div>
        )}
      </div>

      {/* Pending outgoing */}
      {pendingOut.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Pending requests · {pendingOut.length}</h2>
          <div className="card overflow-hidden">
            {pendingOut.map((u, i) => (
              <div key={u.id} className={`flex items-center gap-3 px-4 py-3 ${i < pendingOut.length - 1 ? 'border-b border-slate-100 dark:border-slate-700' : ''}`}>
                <Avatar name={u.display_name || u.username} size="sm" />
                <span className="flex-1 text-sm text-slate-500 dark:text-slate-400">@{u.username}</span>
                <span className="text-xs text-slate-300 dark:text-slate-600">Awaiting response</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <Toast message={toast.msg} visible={toast.show} />
    </div>
  )
}
