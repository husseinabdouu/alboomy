import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Avatar, ProgressBar, Medal, InviteCode, EmptyState, PageLoader, Toast, Spinner } from '../components/ui'
import { TOTAL_STICKERS } from '../lib/stickers'

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

  useEffect(() => { load() }, [id, user])

  async function load() {
    const [groupRes, membersRes] = await Promise.all([
      supabase.from('groups').select('*').eq('id', id).single(),
      supabase.from('group_members')
        .select('*, profile:profiles(id, username, display_name)')
        .eq('group_id', id),
    ])

    if (groupRes.error || !groupRes.data) { navigate('/groups'); return }
    setGroup(groupRes.data)

    const memberList = membersRes.data || []
    setMembers(memberList)
    setIsMember(memberList.some(m => m.user_id === user?.id))
    setIsAdmin(memberList.some(m => m.user_id === user?.id && m.role === 'admin'))

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
              <button onClick={deleteGroup} className="btn-secondary text-xs px-3 py-1.5 text-red-500 border-red-200 dark:border-red-900">
                Delete group
              </button>
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
        {[['leaderboard', 'Leaderboard'], ['members', 'Members']].map(([tab, label]) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab ? 'border-brand-500 text-brand-600 dark:text-brand-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            {label}
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

      <Toast message={toast.msg} visible={toast.show} />
    </div>
  )
}
