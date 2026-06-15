import { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Avatar, ProgressBar, Medal, InviteCode, EmptyState, PageLoader, Toast, Spinner } from '../components/ui'
import { TOTAL_STICKERS } from '../lib/stickers'

function formatRelativeTime(dateStr) {
  const then = new Date(dateStr).getTime()
  const secs = Math.floor((Date.now() - then) / 1000)
  if (secs < 60) return 'just now'
  const mins = Math.floor(secs / 60)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

function ChatTab({ groupId, currentUserId, members }) {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const listRef = useRef(null)
  const inputRef = useRef(null)

  function getProfile(userId) {
    return members.find(m => m.user_id === userId)?.profile
  }

  useEffect(() => {
    let mounted = true

    async function loadMessages() {
      setLoading(true)
      const { data } = await supabase
        .from('group_messages')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: false })
        .limit(50)

      if (mounted) {
        setMessages((data || []).reverse())
        setLoading(false)
      }
    }

    loadMessages()
    return () => { mounted = false }
  }, [groupId])

  useEffect(() => {
    const channel = supabase
      .channel(`group-chat:${groupId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'group_messages',
        filter: `group_id=eq.${groupId}`,
      }, payload => {
        setMessages(prev => {
          if (prev.some(m => m.id === payload.new.id)) return prev
          return [...prev, payload.new]
        })
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [groupId])

  useEffect(() => {
    const el = listRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, loading])

  async function handleSend(e) {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed || sending || !currentUserId) return

    setSending(true)
    await supabase.from('group_messages').insert({
      group_id: groupId,
      user_id: currentUserId,
      content: trimmed,
    })
    setInput('')
    setSending(false)
    inputRef.current?.focus()
  }

  if (loading) {
    return (
      <div className="card flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="card flex flex-col overflow-hidden">
      <div ref={listRef} className="h-[60vh] overflow-y-auto p-4">
        {messages.length === 0 ? (
          <EmptyState icon="💬" title="No messages yet" description="Be the first to say something" />
        ) : (
          <div className="space-y-4">
            {messages.map(msg => {
              const isMe = msg.user_id === currentUserId
              const profile = getProfile(msg.user_id)
              const name = profile?.display_name || profile?.username || 'Unknown'

              return (
                <div key={msg.id} className={`flex gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                  <Avatar
                    name={name}
                    src={profile?.avatar_url}
                    size="sm"
                    className="flex-shrink-0 mt-1"
                  />
                  <div className={`max-w-[75%] min-w-0 ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                    <div className={`flex items-baseline gap-2 mb-1 ${isMe ? 'flex-row-reverse' : ''}`}>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                        {name}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 flex-shrink-0">
                        {formatRelativeTime(msg.created_at)}
                      </span>
                    </div>
                    <div className={`rounded-2xl px-3 py-2 text-sm break-words ${
                      isMe
                        ? 'bg-brand-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <form
        onSubmit={handleSend}
        className="sticky bottom-0 border-t border-slate-200 dark:border-slate-700 p-3 flex gap-2 bg-white dark:bg-slate-800"
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type a message…"
          className="input flex-1"
          disabled={!currentUserId || sending}
        />
        <button
          type="submit"
          disabled={!input.trim() || sending || !currentUserId}
          className="btn-primary px-4 flex items-center justify-center gap-2 flex-shrink-0"
        >
          {sending ? <Spinner size="sm" /> : 'Send'}
        </button>
      </form>
    </div>
  )
}

export default function GroupDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [group, setGroup] = useState(null)
  const [members, setMembers] = useState([])
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const [isMember, setIsMember] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [activeTab, setActiveTab] = useState('leaderboard')
  const [toast, setToast] = useState({ msg: '', show: false })
  const [leaving, setLeaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editError, setEditError] = useState('')
  const [saving, setSaving] = useState(false)
  const [unreadChat, setUnreadChat] = useState(false)

  useEffect(() => { load() }, [id, user])

  useEffect(() => {
    if (activeTab === 'chat' && unreadChat && user?.id) {
      supabase
        .from('group_members')
        .update({ last_read_at: new Date().toISOString() })
        .eq('group_id', id)
        .eq('user_id', user.id)
      setUnreadChat(false)
    }
  }, [activeTab, unreadChat, id, user?.id])

  async function load() {
    const [groupRes, membersRes] = await Promise.all([
      supabase.from('groups').select('*').eq('id', id).single(),
      supabase.from('group_members')
        .select('*, profile:profiles(id, username, display_name, avatar_url)')
        .eq('group_id', id),
    ])

    if (groupRes.error || !groupRes.data) { navigate('/groups'); return }
    setGroup(groupRes.data)

    const memberList = membersRes.data || []
    setMembers(memberList)
    setIsMember(memberList.some(m => m.user_id === user?.id))
    setIsAdmin(memberList.some(m => m.user_id === user?.id && m.role === 'admin'))

    const myMember = memberList.find(m => m.user_id === user?.id)
    if (myMember && user?.id) {
      const { count } = await supabase
        .from('group_messages')
        .select('id', { count: 'exact', head: true })
        .eq('group_id', id)
        .gt('created_at', myMember.last_read_at)
      setUnreadChat((count || 0) > 0)
    } else {
      setUnreadChat(false)
    }

    // Build leaderboard
    const memberIds = memberList.map(m => m.user_id)
    if (memberIds.length > 0) {
      const { data: lbData } = await supabase
        .from('leaderboard_view')
        .select('*')
        .in('id', memberIds)
        .order('total_collected', { ascending: false })
      setLeaderboard(lbData || [])
    }

    setLoading(false)
  }

  async function leaveGroup() {
    if (!confirm('Leave this group?')) return
    setLeaving(true)
    await supabase.from('group_members').delete().eq('group_id', id).eq('user_id', user.id)
    navigate('/groups')
  }

  async function deleteGroup() {
    if (!confirm('Delete this group? This cannot be undone.')) return
    await supabase.from('groups').delete().eq('id', id)
    navigate('/groups')
  }

  function showToast(msg) {
    setToast({ msg, show: true })
    setTimeout(() => setToast(t => ({ ...t, show: false })), 2000)
  }

  function openEdit() {
    setEditName(group.name)
    setEditDescription(group.description || '')
    setEditError('')
    setEditing(true)
  }

  async function saveGroupEdit() {
    const trimmedName = editName.trim()
    const trimmedDescription = editDescription.trim()
    if (!trimmedName) {
      setEditError('Group name is required')
      return
    }

    setEditError('')
    setSaving(true)
    const { error } = await supabase
      .from('groups')
      .update({ name: trimmedName, description: trimmedDescription || null })
      .eq('id', group.id)

    setSaving(false)
    if (error) {
      setEditError(error.message)
      return
    }

    setGroup(g => ({ ...g, name: trimmedName, description: trimmedDescription || null }))
    setEditing(false)
    showToast('Group updated')
  }

  if (loading) return <PageLoader />
  if (!group) return null

  const inviteUrl = `${window.location.origin}/join/${group.invite_code}`

  return (
    <div className="pb-20 sm:pb-0">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Link to="/groups" className="text-sm text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">Groups</Link>
              <svg className="w-3 h-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </div>
            <h1 className="page-title truncate">{group.name}</h1>
            {group.description && <p className="page-subtitle">{group.description}</p>}
            <div className="flex items-center gap-3 mt-2">
              <span className="text-xs text-slate-500 dark:text-slate-400">👥 {members.length} member{members.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {isMember && !isAdmin && (
              <button onClick={leaveGroup} disabled={leaving} className="btn-secondary text-xs px-3 py-1.5 text-red-500 border-red-200 dark:border-red-900">
                {leaving ? <Spinner size="sm" /> : 'Leave'}
              </button>
            )}
            {isAdmin && (
              <>
                <button onClick={openEdit} className="btn-secondary text-xs px-3 py-1.5">
                  Edit
                </button>
                <button onClick={deleteGroup} className="btn-secondary text-xs px-3 py-1.5 text-red-500 border-red-200 dark:border-red-900">
                  Delete group
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Invite code */}
      <div className="card p-5 mb-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Invite friends</h3>
          <span className="badge-brand">Share this code</span>
        </div>
        <InviteCode code={group.invite_code} url={inviteUrl} />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-700 mb-5">
        {[['leaderboard', 'Leaderboard'], ['chat', 'Chat'], ['members', 'Members']].map(([tab, label]) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`relative px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab ? 'border-brand-500 text-brand-600 dark:text-brand-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            {label}
            {tab === 'chat' && unreadChat && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Leaderboard */}
      {activeTab === 'leaderboard' && (
        leaderboard.length === 0 ? (
          <EmptyState icon="🏆" title="No data yet" description="Members need to collect some stickers first" />
        ) : (
          <div className="card overflow-hidden">
            {leaderboard.map((entry, i) => {
              const isMe = entry.id === user?.id
              const rank = i + 1
              return (
                <Link
                  key={entry.id}
                  to={`/u/${entry.username}`}
                  className={`flex items-center gap-3 px-4 py-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700 ${i < leaderboard.length - 1 ? 'border-b border-slate-100 dark:border-slate-700' : ''} ${isMe ? 'bg-brand-50 dark:bg-brand-950' : ''}`}
                >
                  <div className="w-8 flex items-center justify-center flex-shrink-0">
                    <Medal rank={rank} />
                  </div>
                  <Avatar name={entry.display_name || entry.username} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-sm font-semibold truncate ${isMe ? 'text-brand-700 dark:text-brand-300' : 'text-slate-900 dark:text-white'}`}>
                        {entry.display_name || entry.username}
                      </span>
                      {isMe && <span className="badge-brand text-xs">you</span>}
                    </div>
                    <p className="text-xs text-slate-400 dark:text-slate-500">@{entry.username}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{entry.total_collected}</span>
                    <ProgressBar value={entry.total_collected} max={TOTAL_STICKERS} className="w-20" size="sm" />
                    <span className="text-xs text-slate-400">{entry.completion_pct}%</span>
                  </div>
                </Link>
              )
            })}
          </div>
        )
      )}

      {/* Members */}
      {activeTab === 'members' && (
        <div className="space-y-2">
          {members.map(m => (
            <Link key={m.id} to={`/u/${m.profile.username}`} className="card p-4 flex items-center gap-3 hover:shadow-card-hover transition-all">
              <Avatar name={m.profile.display_name || m.profile.username} size="md" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                    {m.profile.display_name || m.profile.username}
                  </span>
                  {m.role === 'admin' && <span className="badge-amber text-xs">Admin</span>}
                  {m.user_id === user?.id && <span className="badge-brand text-xs">You</span>}
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500">@{m.profile.username}</p>
              </div>
              <svg className="w-4 h-4 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      )}

      {activeTab === 'chat' && (
        <ChatTab groupId={group.id} currentUserId={user?.id} members={members} />
      )}

      {editing && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-md shadow-modal p-6">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-5">Edit group</h2>
            <div className="space-y-4">
              <div>
                <label className="label">Group name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  maxLength={50}
                  className="input"
                  autoFocus
                />
              </div>
              <div>
                <label className="label">Description (optional)</label>
                <input
                  type="text"
                  value={editDescription}
                  onChange={e => setEditDescription(e.target.value)}
                  maxLength={100}
                  className="input"
                />
              </div>

              {editError && (
                <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
                  <p className="text-sm text-red-600 dark:text-red-400">{editError}</p>
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  disabled={saving}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveGroupEdit}
                  disabled={saving}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {saving && <Spinner size="sm" />}
                  {saving ? 'Saving…' : 'Save changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Toast message={toast.msg} visible={toast.show} />
    </div>
  )
}
