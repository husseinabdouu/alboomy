import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Avatar, EmptyState, PageLoader } from '../components/ui'

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

function UnreadBadge({ count }) {
  if (!count || count <= 0) return null
  return (
    <span className="min-w-[16px] h-4 px-1 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full leading-none flex-shrink-0">
      {count > 9 ? '9+' : count}
    </span>
  )
}

function ConversationRow({ friend, lastMessage, unreadCount }) {
  const name = friend.display_name || friend.username
  const preview = lastMessage
    ? (lastMessage.sender_id === friend.id ? '' : 'You: ') + lastMessage.content
    : null

  return (
    <Link
      to={`/messages/${friend.username}`}
      className="card p-4 flex items-center gap-3 hover:shadow-card-hover transition-all"
    >
      <Avatar name={name} src={friend.avatar_url} size="md" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">{name}</span>
          {lastMessage && (
            <span className="text-[10px] text-slate-400 dark:text-slate-500 flex-shrink-0">
              {formatRelativeTime(lastMessage.created_at)}
            </span>
          )}
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500">@{friend.username}</p>
        {preview && (
          <p className="text-sm text-slate-500 dark:text-slate-400 truncate mt-1">{preview}</p>
        )}
      </div>
      <UnreadBadge count={unreadCount} />
    </Link>
  )
}

export default function MessagesPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [withMessages, setWithMessages] = useState([])
  const [withoutMessages, setWithoutMessages] = useState([])

  useEffect(() => {
    if (user) load()
  }, [user])

  async function load() {
    const { data: friendshipData } = await supabase
      .from('friendships')
      .select(`
        id, status, requester_id, addressee_id,
        requester:profiles!friendships_requester_id_fkey(id, username, display_name, avatar_url),
        addressee:profiles!friendships_addressee_id_fkey(id, username, display_name, avatar_url)
      `)
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)

    const friends = (friendshipData || [])
      .filter(f => f.status === 'accepted')
      .map(f => (f.requester_id === user.id ? f.addressee : f.requester))

    if (friends.length === 0) {
      setWithMessages([])
      setWithoutMessages([])
      setLoading(false)
      return
    }

    const friendIds = new Set(friends.map(f => f.id))

    const { data: messages } = await supabase
      .from('direct_messages')
      .select('*')
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .order('created_at', { ascending: false })

    const latestByFriend = new Map()
    const unreadByFriend = new Map()

    for (const msg of messages || []) {
      const otherId = msg.sender_id === user.id ? msg.recipient_id : msg.recipient_id === user.id ? msg.sender_id : null
      if (!otherId || !friendIds.has(otherId)) continue

      if (!latestByFriend.has(otherId)) {
        latestByFriend.set(otherId, msg)
      }

      if (msg.sender_id === otherId && msg.recipient_id === user.id && !msg.read_at) {
        unreadByFriend.set(otherId, (unreadByFriend.get(otherId) || 0) + 1)
      }
    }

    const active = []
    const inactive = []

    for (const friend of friends) {
      const lastMessage = latestByFriend.get(friend.id) || null
      const unreadCount = unreadByFriend.get(friend.id) || 0
      const entry = { friend, lastMessage, unreadCount }

      if (lastMessage) active.push(entry)
      else inactive.push(entry)
    }

    active.sort((a, b) => new Date(b.lastMessage.created_at) - new Date(a.lastMessage.created_at))
    inactive.sort((a, b) => (a.friend.display_name || a.friend.username).localeCompare(b.friend.display_name || b.friend.username))

    setWithMessages(active)
    setWithoutMessages(inactive)
    setLoading(false)
  }

  if (loading) return <PageLoader />

  const totalFriends = withMessages.length + withoutMessages.length

  return (
    <div className="pb-20 sm:pb-0">
      <div className="page-header">
        <h1 className="page-title">Messages</h1>
        <p className="page-subtitle">Direct messages with your friends</p>
      </div>

      {totalFriends === 0 ? (
        <EmptyState
          icon="💬"
          title="No friends yet"
          description="Add friends first to start messaging"
          action={<Link to="/friends" className="btn-primary">Go to Friends</Link>}
        />
      ) : (
        <div className="space-y-6">
          {withMessages.length > 0 && (
            <div className="space-y-2">
              {withMessages.map(({ friend, lastMessage, unreadCount }) => (
                <ConversationRow
                  key={friend.id}
                  friend={friend}
                  lastMessage={lastMessage}
                  unreadCount={unreadCount}
                />
              ))}
            </div>
          )}

          {withoutMessages.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                Start a conversation
              </h2>
              <div className="space-y-2">
                {withoutMessages.map(({ friend, unreadCount }) => (
                  <ConversationRow
                    key={friend.id}
                    friend={friend}
                    lastMessage={null}
                    unreadCount={unreadCount}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
