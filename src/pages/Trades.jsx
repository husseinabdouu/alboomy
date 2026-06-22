import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Avatar, EmptyState, PageLoader, Spinner, Toast } from '../components/ui'
import { ALL_STICKERS } from '../lib/stickers'

function stickerById(id) {
  return ALL_STICKERS.find(s => s.id === id) || null
}

function stickerLabel(id) {
  const s = stickerById(id)
  return s ? `${s.id} · ${s.label}` : id
}

function ProposalModal({ modal, friendMatch, userId, onClose, onSent }) {
  const [saving, setSaving] = useState(false)
  const { friend, step, offeredSticker, requestedSticker } = modal
  const { canGive, canReceive } = friendMatch
  const friendName = friend.display_name || friend.username

  async function sendProposal(requestedId) {
    setSaving(true)
    const { data, error } = await supabase.from('swap_requests').insert({
      from_user: userId,
      to_user: friend.id,
      offered_sticker: offeredSticker.id,
      requested_sticker: requestedId || '',
      status: 'pending',
    }).select('*').single()

    setSaving(false)
    if (!error && data) {
      onSent(data)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="card w-full max-w-md max-h-[85vh] flex flex-col shadow-modal">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-700">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">Propose trade with {friendName}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Step {step} of 2</p>
          </div>
          <button type="button" onClick={onClose} className="btn-ghost p-2" disabled={saving}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {step === 1 ? (
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Choose a sticker to offer</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Your duplicates that {friendName} needs:</p>
              {canGive.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-6">
                  You don&apos;t have any duplicates {friendName} needs right now
                </p>
              ) : (
                <div className="space-y-2">
                  {canGive.map(s => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => onClose({ ...modal, step: 2, offeredSticker: s })}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors"
                    >
                      <span className="text-xs font-bold text-brand-500 w-14 flex-shrink-0">{s.id}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{s.label}</div>
                        <div className="text-xs text-slate-400">{s.flag} {s.team}</div>
                      </div>
                      <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 flex-shrink-0">Offer this →</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-800">
                <span className="text-xs font-bold text-brand-500">{offeredSticker.id}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{offeredSticker.label}</div>
                  <div className="text-xs text-slate-500">{offeredSticker.flag} {offeredSticker.team}</div>
                </div>
                <button
                  type="button"
                  onClick={() => onClose({ ...modal, step: 1, offeredSticker: null, requestedSticker: null })}
                  className="text-xs text-brand-600 dark:text-brand-400 hover:underline flex-shrink-0"
                  disabled={saving}
                >
                  ← Change
                </button>
              </div>

              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Choose what you want in return</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Their duplicates that you need:</p>

              {canReceive.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                    {friendName} doesn&apos;t have any duplicates you need right now. You can still send the offer without requesting anything specific.
                  </p>
                  <button
                    type="button"
                    onClick={() => sendProposal(null)}
                    disabled={saving}
                    className="btn-primary flex items-center justify-center gap-2 mx-auto"
                  >
                    {saving && <Spinner size="sm" />}
                    Send anyway
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {canReceive.map(s => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => sendProposal(s.id)}
                      disabled={saving}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors disabled:opacity-50"
                    >
                      <span className="text-xs font-bold text-brand-500 w-14 flex-shrink-0">{s.id}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{s.label}</div>
                        <div className="text-xs text-slate-400">{s.flag} {s.team}</div>
                      </div>
                      <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 flex-shrink-0">
                        {saving ? <Spinner size="sm" /> : 'Request this'}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function TradesPage() {
  const { user } = useAuth()
  const [friends, setFriends] = useState([])
  const [myDuplicates, setMyDuplicates] = useState([])
  const [friendMatches, setFriendMatches] = useState([])
  const [pendingIncoming, setPendingIncoming] = useState([])
  const [pendingOutgoing, setPendingOutgoing] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('matches')
  const [proposalModal, setProposalModal] = useState(null)
  const [actionLoading, setActionLoading] = useState('')
  const [toast, setToast] = useState({ msg: '', show: false })

  const showToast = useCallback((msg) => {
    setToast({ msg, show: true })
    setTimeout(() => setToast(t => ({ ...t, show: false })), 2000)
  }, [])

  const load = useCallback(async () => {
    if (!user?.id) return
    setLoading(true)

    const { data: friendshipData } = await supabase
      .from('friendships')
      .select(`
        id, status, requester_id, addressee_id,
        requester:profiles!friendships_requester_id_fkey(id, username, display_name, avatar_url),
        addressee:profiles!friendships_addressee_id_fkey(id, username, display_name, avatar_url)
      `)
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)

    const friendList = (friendshipData || [])
      .filter(f => f.status === 'accepted')
      .map(f => (f.requester_id === user.id ? f.addressee : f.requester))

    setFriends(friendList)

    const friendIds = friendList.map(f => f.id)

    const [myColRes, myDupRes, allColRes, allDupRes, incomingRes, outgoingRes] = await Promise.all([
      supabase.from('collections').select('sticker_id').eq('user_id', user.id),
      supabase.from('duplicates').select('*').eq('user_id', user.id),
      friendIds.length
        ? supabase.from('collections').select('user_id, sticker_id').in('user_id', friendIds)
        : Promise.resolve({ data: [] }),
      friendIds.length
        ? supabase.from('duplicates').select('*').in('user_id', friendIds)
        : Promise.resolve({ data: [] }),
      supabase.from('swap_requests').select('*').eq('to_user', user.id).eq('status', 'pending').order('created_at', { ascending: false }),
      supabase.from('swap_requests').select('*').eq('from_user', user.id).eq('status', 'pending').order('created_at', { ascending: false }),
    ])

    const myCollection = new Set(myColRes.data?.map(r => r.sticker_id) || [])
    const myDups = myDupRes.data || []
    setMyDuplicates(myDups)

    const collectionsByFriend = new Map()
    for (const row of allColRes.data || []) {
      if (!collectionsByFriend.has(row.user_id)) collectionsByFriend.set(row.user_id, new Set())
      collectionsByFriend.get(row.user_id).add(row.sticker_id)
    }

    const duplicatesByFriend = new Map()
    for (const dup of allDupRes.data || []) {
      if (!duplicatesByFriend.has(dup.user_id)) duplicatesByFriend.set(dup.user_id, [])
      duplicatesByFriend.get(dup.user_id).push(dup)
    }

    const matches = friendList.map(friend => {
      const friendCol = collectionsByFriend.get(friend.id) || new Set()
      const friendDups = duplicatesByFriend.get(friend.id) || []

      const canGive = myDups
        .filter(d => !friendCol.has(d.sticker_id))
        .map(d => stickerById(d.sticker_id))
        .filter(Boolean)

      const canReceive = friendDups
        .filter(d => !myCollection.has(d.sticker_id))
        .map(d => stickerById(d.sticker_id))
        .filter(Boolean)

      return { friend, canGive, canReceive }
    }).filter(m => m.canGive.length > 0 || m.canReceive.length > 0)

    matches.sort((a, b) => (b.canGive.length + b.canReceive.length) - (a.canGive.length + a.canReceive.length))
    setFriendMatches(matches)

    const incoming = incomingRes.data || []
    const outgoing = outgoingRes.data || []
    const profileIds = [...new Set([
      ...incoming.map(r => r.from_user),
      ...outgoing.map(r => r.to_user),
    ])]

    let profileMap = new Map()
    if (profileIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url')
        .in('id', profileIds)
      profileMap = new Map((profiles || []).map(p => [p.id, p]))
    }

    setPendingIncoming(incoming.map(r => ({ ...r, profile: profileMap.get(r.from_user) })))
    setPendingOutgoing(outgoing.map(r => ({ ...r, profile: profileMap.get(r.to_user) })))
    setLoading(false)
  }, [user?.id])

  useEffect(() => {
    load()
  }, [load])

  function openProposal(friend) {
    const match = friendMatches.find(m => m.friend.id === friend.id)
    if (!match) return
    setProposalModal({ friend, step: 1, offeredSticker: null, requestedSticker: null })
  }

  function handleModalClose(next) {
    if (typeof next === 'object' && next !== null && 'step' in next) {
      setProposalModal(next)
      return
    }
    setProposalModal(null)
  }

  function handleProposalSent(newRequest) {
    const match = friendMatches.find(m => m.friend.id === proposalModal.friend.id)
    const name = match?.friend.display_name || match?.friend.username || 'Friend'
    setPendingOutgoing(prev => [{ ...newRequest, profile: proposalModal.friend }, ...prev])
    setProposalModal(null)
    showToast(`Trade proposed! ${name} will be notified.`)
  }

  async function acceptSwap(id) {
    setActionLoading(id)
    await supabase.from('swap_requests').update({ status: 'accepted' }).eq('id', id)
    setPendingIncoming(prev => prev.filter(r => r.id !== id))
    setActionLoading('')
    showToast('Trade accepted!')
  }

  async function declineSwap(id) {
    setActionLoading(id)
    await supabase.from('swap_requests').update({ status: 'declined' }).eq('id', id)
    setPendingIncoming(prev => prev.filter(r => r.id !== id))
    setActionLoading('')
  }

  async function cancelSwap(id) {
    setActionLoading(id)
    await supabase.from('swap_requests').update({ status: 'cancelled' }).eq('id', id)
    setPendingOutgoing(prev => prev.filter(r => r.id !== id))
    setActionLoading('')
  }

  if (loading) return <PageLoader />

  const pendingCount = pendingIncoming.length + pendingOutgoing.length
  const activeMatch = proposalModal
    ? friendMatches.find(m => m.friend.id === proposalModal.friend.id)
    : null

  return (
    <div className="pb-20 sm:pb-0">
      <div className="page-header">
        <h1 className="page-title">Trades</h1>
        <p className="page-subtitle">
          {friendMatches.length > 0
            ? `You have potential trades with ${friendMatches.length} friend${friendMatches.length !== 1 ? 's' : ''}`
            : 'Find sticker swaps with your friends'}
        </p>
      </div>

      <div className="flex border-b border-slate-200 dark:border-slate-700 mb-5">
        {[
          ['matches', 'Matches'],
          ['pending', `Pending (${pendingCount})`],
        ].map(([tab, label]) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'matches' && (
        friendMatches.length === 0 ? (
          <EmptyState
            icon="🔄"
            title="No trade matches yet"
            description="Add your duplicate stickers and your friends will be matched automatically when they need something you have"
          />
        ) : (
          <div className="space-y-3">
            {friendMatches.map(({ friend, canGive, canReceive }) => (
              <div key={friend.id} className="card p-4 flex items-center gap-3">
                <Avatar name={friend.display_name || friend.username} src={friend.avatar_url} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                    {friend.display_name || friend.username}
                  </div>
                  <p className="text-xs text-slate-400 dark:text-slate-500">@{friend.username}</p>
                  <div className="mt-1.5 space-y-0.5">
                    {canGive.length > 0 && (
                      <p className="text-xs font-medium text-brand-600 dark:text-brand-400">
                        ↑ {canGive.length} you can give
                      </p>
                    )}
                    {canReceive.length > 0 && (
                      <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                        ↓ {canReceive.length} you can receive
                      </p>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => openProposal(friend)}
                  className="btn-primary text-xs px-3 py-1.5 flex-shrink-0"
                >
                  Trade
                </button>
              </div>
            ))}
          </div>
        )
      )}

      {activeTab === 'pending' && (
        pendingCount === 0 ? (
          <EmptyState icon="📬" title="No pending proposals" description="Propose a trade from the Matches tab" />
        ) : (
          <div className="space-y-6">
            <div>
              <h2 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                Incoming · {pendingIncoming.length}
              </h2>
              {pendingIncoming.length === 0 ? (
                <p className="text-sm text-slate-400 dark:text-slate-500">No incoming proposals</p>
              ) : (
                <div className="space-y-2">
                  {pendingIncoming.map(req => {
                    const p = req.profile
                    const offered = stickerLabel(req.offered_sticker)
                    const requested = req.requested_sticker ? stickerLabel(req.requested_sticker) : 'nothing specific'
                    return (
                      <div key={req.id} className="card p-4">
                        <div className="flex items-start gap-3">
                          <Avatar name={p?.display_name || p?.username || '?'} src={p?.avatar_url} size="md" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">
                              {p?.display_name || p?.username}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              offers <span className="font-medium">{offered}</span> for your{' '}
                              <span className="font-medium">{requested}</span>
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <button
                            type="button"
                            onClick={() => acceptSwap(req.id)}
                            disabled={actionLoading === req.id}
                            className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1.5"
                          >
                            {actionLoading === req.id && <Spinner size="sm" />}
                            Accept
                          </button>
                          <button
                            type="button"
                            onClick={() => declineSwap(req.id)}
                            disabled={actionLoading === req.id}
                            className="btn-secondary text-xs px-3 py-1.5"
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                Sent · {pendingOutgoing.length}
              </h2>
              {pendingOutgoing.length === 0 ? (
                <p className="text-sm text-slate-400 dark:text-slate-500">No sent proposals</p>
              ) : (
                <div className="space-y-2">
                  {pendingOutgoing.map(req => {
                    const p = req.profile
                    const offered = stickerLabel(req.offered_sticker)
                    const requested = req.requested_sticker ? stickerLabel(req.requested_sticker) : 'nothing specific'
                    return (
                      <div key={req.id} className="card p-4 flex items-center gap-3">
                        <Avatar name={p?.display_name || p?.username || '?'} src={p?.avatar_url} size="md" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">
                            {p?.display_name || p?.username}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            You offered <span className="font-medium">{offered}</span> for their{' '}
                            <span className="font-medium">{requested}</span>
                          </p>
                        </div>
                        <span className="badge-slate text-xs flex-shrink-0">Pending</span>
                        <button
                          type="button"
                          onClick={() => cancelSwap(req.id)}
                          disabled={actionLoading === req.id}
                          className="btn-secondary text-xs px-3 py-1.5 flex-shrink-0"
                        >
                          Cancel
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )
      )}

      {proposalModal && activeMatch && (
        <ProposalModal
          modal={proposalModal}
          friendMatch={activeMatch}
          userId={user.id}
          onClose={handleModalClose}
          onSent={handleProposalSent}
        />
      )}

      <Toast message={toast.msg} visible={toast.show} />
    </div>
  )
}
