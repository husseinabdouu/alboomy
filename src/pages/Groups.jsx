import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Avatar, ProgressBar, EmptyState, PageLoader, Toast, Spinner } from '../components/ui'
import { TOTAL_STICKERS } from '../lib/stickers'

function CreateGroupModal({ onClose, onCreated }) {
  const { user } = useAuth()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function create(e) {
    e.preventDefault()
    if (!name.trim()) { setError('Group name is required'); return }
    setLoading(true)
    const { data, error } = await supabase
      .from('groups')
      .insert({ name: name.trim(), description: description.trim() || null, created_by: user.id })
      .select()
      .single()
    if (error) { setError(error.message); setLoading(false); return }
    // Add creator as admin member
    await supabase.from('group_members').insert({ group_id: data.id, user_id: user.id, role: 'admin' })
    onCreated(data)
  }

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="card w-full max-w-md shadow-modal">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-700">
          <h3 className="font-semibold text-slate-900 dark:text-white">Create a group</h3>
          <button onClick={onClose} className="btn-ghost p-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={create} className="p-5 space-y-4">
          <div>
            <label className="label">Group name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. The Boys, NYU Squad…"
              className="input"
              autoFocus
              maxLength={50}
            />
          </div>
          <div>
            <label className="label">Description <span className="text-slate-400 font-normal">(optional)</span></label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What's this group about?"
              className="input"
              maxLength={100}
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {loading && <Spinner size="sm" />}
              {loading ? 'Creating…' : 'Create group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function GroupCard({ group }) {
  const [memberCount, setMemberCount] = useState(null)

  useEffect(() => {
    supabase.from('group_members').select('id', { count: 'exact', head: true }).eq('group_id', group.id)
      .then(({ count }) => setMemberCount(count || 0))
  }, [group.id])

  return (
    <Link to={`/groups/${group.id}`} className="card p-5 block hover:shadow-card-hover transition-all duration-150">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white truncate">{group.name}</h3>
          {group.description && <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 truncate">{group.description}</p>}
          <div className="flex items-center gap-3 mt-3">
            {memberCount !== null && (
              <span className="text-xs text-slate-500 dark:text-slate-400">
                👥 {memberCount} member{memberCount !== 1 ? 's' : ''}
              </span>
            )}
            <span className="text-xs font-mono font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950 px-2 py-0.5 rounded">
              {group.invite_code}
            </span>
          </div>
        </div>
        <svg className="w-4 h-4 text-slate-400 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  )
}

function JoinByCodeSection({ userId, onJoined }) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function join(e) {
    e.preventDefault()
    if (!code.trim()) return
    setLoading(true)
    setError('')

    const { data: group } = await supabase.from('groups').select('*').eq('invite_code', code.trim().toUpperCase()).maybeSingle()
    if (!group) { setError('No group found with that code'); setLoading(false); return }

    const { error } = await supabase.from('group_members').insert({ group_id: group.id, user_id: userId, role: 'member' })
    if (error?.code === '23505') { setError('You\'re already in this group'); setLoading(false); return }
    if (error) { setError('Could not join group'); setLoading(false); return }

    onJoined()
    setCode('')
  }

  return (
    <div className="card p-5">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">Join with a code</h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Enter a 6-character invite code from a friend</p>
      <form onSubmit={join} className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={e => setCode(e.target.value.toUpperCase())}
          placeholder="ABC123"
          maxLength={6}
          className="input flex-1 font-mono font-semibold tracking-widest uppercase text-center"
        />
        <button type="submit" disabled={loading || code.length < 6} className="btn-primary px-4 flex-shrink-0">
          {loading ? <Spinner size="sm" /> : 'Join'}
        </button>
      </form>
      {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
    </div>
  )
}

export default function GroupsPage() {
  const { user } = useAuth()
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [toast, setToast] = useState({ msg: '', show: false })

  useEffect(() => { loadGroups() }, [user])

  async function loadGroups() {
    if (!user) return
    const { data } = await supabase
      .from('group_members')
      .select('group_id, groups(*)')
      .eq('user_id', user.id)
      .order('joined_at', { ascending: false })
    setGroups(data?.map(d => d.groups) || [])
    setLoading(false)
  }

  function onCreated(group) {
    setCreating(false)
    setGroups(prev => [group, ...prev])
    setToast({ msg: 'Group created!', show: true })
    setTimeout(() => setToast(t => ({ ...t, show: false })), 2000)
  }

  function onJoined() {
    loadGroups()
    setToast({ msg: 'Joined group!', show: true })
    setTimeout(() => setToast(t => ({ ...t, show: false })), 2000)
  }

  if (loading) return <PageLoader />

  return (
    <div className="pb-20 sm:pb-0">
      <div className="page-header flex items-start justify-between">
        <div>
          <h1 className="page-title">Groups</h1>
          <p className="page-subtitle">Compete with friends and track progress together</p>
        </div>
        <button onClick={() => setCreating(true)} className="btn-primary flex items-center gap-1.5 flex-shrink-0">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New group
        </button>
      </div>

      <JoinByCodeSection userId={user?.id} onJoined={onJoined} />

      <div className="mt-6">
        <h2 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
          My groups · {groups.length}
        </h2>
        {groups.length === 0 ? (
          <EmptyState
            icon="🏆"
            title="No groups yet"
            description="Create a group and invite friends, or join one with a code"
            action={
              <button onClick={() => setCreating(true)} className="btn-primary">
                Create your first group
              </button>
            }
          />
        ) : (
          <div className="space-y-3">
            {groups.map(g => <GroupCard key={g.id} group={g} />)}
          </div>
        )}
      </div>

      {creating && <CreateGroupModal onClose={() => setCreating(false)} onCreated={onCreated} />}
      <Toast message={toast.msg} visible={toast.show} />
    </div>
  )
}
