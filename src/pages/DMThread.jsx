import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Avatar, EmptyState, PageLoader, Spinner } from '../components/ui'

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

export default function DMThreadPage() {
  const { username } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [friend, setFriend] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const listRef = useRef(null)
  const inputRef = useRef(null)

  const markRead = useCallback(async (friendId) => {
    if (!user?.id || !friendId) return
    await supabase
      .from('direct_messages')
      .update({ read_at: new Date().toISOString() })
      .eq('sender_id', friendId)
      .eq('recipient_id', user.id)
      .is('read_at', null)
  }, [user?.id])

  useEffect(() => {
    if (!user || !username) return
    loadThread()
  }, [user, username])

  useEffect(() => {
    if (!user?.id || !friend?.id) return

    const channel = supabase
      .channel(`dm:${user.id}:${friend.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'direct_messages',
      }, payload => {
        const msg = payload.new
        const isOurs = (msg.sender_id === user.id && msg.recipient_id === friend.id)
          || (msg.sender_id === friend.id && msg.recipient_id === user.id)
        if (!isOurs) return

        setMessages(prev => {
          if (prev.some(m => m.id === msg.id)) return prev
          return [...prev, msg]
        })

        if (msg.sender_id === friend.id) {
          markRead(friend.id)
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user?.id, friend?.id, markRead])

  useEffect(() => {
    const el = listRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, loading])

  async function loadThread() {
    setLoading(true)
    setError('')

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url')
      .eq('username', username)
      .single()

    if (!profile) {
      setError('User not found')
      setLoading(false)
      return
    }

    const { data: friendship } = await supabase
      .from('friendships')
      .select('status')
      .or(`and(requester_id.eq.${user.id},addressee_id.eq.${profile.id}),and(requester_id.eq.${profile.id},addressee_id.eq.${user.id})`)
      .maybeSingle()

    if (friendship?.status !== 'accepted') {
      navigate('/messages', { replace: true })
      return
    }

    setFriend(profile)

    const { data } = await supabase
      .from('direct_messages')
      .select('*')
      .or(`and(sender_id.eq.${user.id},recipient_id.eq.${profile.id}),and(sender_id.eq.${profile.id},recipient_id.eq.${user.id})`)
      .order('created_at', { ascending: true })

    setMessages(data || [])
    await markRead(profile.id)
    setLoading(false)
  }

  async function handleSend(e) {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed || sending || !user?.id || !friend?.id) return

    setSending(true)
    await supabase.from('direct_messages').insert({
      sender_id: user.id,
      recipient_id: friend.id,
      content: trimmed,
    })
    setInput('')
    setSending(false)
    inputRef.current?.focus()
  }

  if (loading) return <PageLoader />

  if (error || !friend) {
    return (
      <div className="py-20 text-center">
        <div className="text-4xl mb-4">🔍</div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{error || 'Conversation not found'}</h2>
        <Link to="/messages" className="btn-primary">Back to Messages</Link>
      </div>
    )
  }

  const friendName = friend.display_name || friend.username

  return (
    <div className="pb-20 sm:pb-0 flex flex-col">
      <div className="page-header border-b border-slate-200 dark:border-slate-700 -mx-4 px-4 pb-4 mb-0">
        <div className="flex items-center gap-3">
          <Link
            to="/messages"
            className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex-shrink-0"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <Avatar name={friendName} src={friend.avatar_url} size="md" />
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-slate-900 dark:text-white truncate">{friendName}</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">@{friend.username}</p>
          </div>
        </div>
      </div>

      <div className="card flex flex-col overflow-hidden mt-4 flex-1">
        <div ref={listRef} className="h-[70vh] overflow-y-auto p-4">
          {messages.length === 0 ? (
            <EmptyState icon="💬" title="No messages yet" description={`Say hello to ${friendName}!`} />
          ) : (
            <div className="space-y-4">
              {messages.map(msg => {
                const isMe = msg.sender_id === user.id
                return (
                  <div key={msg.id} className={`flex gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                    {!isMe && (
                      <Avatar name={friendName} src={friend.avatar_url} size="sm" className="flex-shrink-0 mt-1" />
                    )}
                    <div className={`max-w-[75%] min-w-0 ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 mb-1">
                        {formatRelativeTime(msg.created_at)}
                      </span>
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
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!input.trim() || sending}
            className="btn-primary px-4 flex items-center justify-center gap-2 flex-shrink-0"
          >
            {sending ? <Spinner size="sm" /> : 'Send'}
          </button>
        </form>
      </div>
    </div>
  )
}
