import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Spinner, PageLoader } from '../components/ui'

export default function JoinGroupPage() {
  const { code } = useParams()
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [group, setGroup] = useState(null)
  const [memberCount, setMemberCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [alreadyMember, setAlreadyMember] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!code) return
    loadGroup()
  }, [code])

  async function loadGroup() {
    const { data: g } = await supabase.from('groups').select('*').eq('invite_code', code.toUpperCase()).maybeSingle()
    if (!g) { setError('Group not found — check the invite code and try again'); setLoading(false); return }
    setGroup(g)

    const { count } = await supabase.from('group_members').select('id', { count: 'exact', head: true }).eq('group_id', g.id)
    setMemberCount(count || 0)

    if (user) {
      const { data: membership } = await supabase.from('group_members').select('id').eq('group_id', g.id).eq('user_id', user.id).maybeSingle()
      setAlreadyMember(!!membership)
    }

    setLoading(false)
  }

  async function join() {
    if (!user) { navigate(`/auth?redirect=/join/${code}`); return }
    setJoining(true)
    const { error } = await supabase.from('group_members').insert({ group_id: group.id, user_id: user.id, role: 'member' })
    if (error) { setError('Could not join group'); setJoining(false); return }
    navigate(`/groups/${group.id}`)
  }

  if (authLoading || loading) return <PageLoader />

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link to="/" className="font-bold text-2xl text-slate-900 dark:text-white">
            Alb<span className="text-brand-500">oomy</span>
          </Link>
        </div>

        {error ? (
          <div className="card p-8 text-center">
            <div className="text-4xl mb-4">🤔</div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Group not found</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">{error}</p>
            <Link to="/groups" className="btn-primary">Back to groups</Link>
          </div>
        ) : group ? (
          <div className="card p-8 text-center">
            <div className="text-4xl mb-4">🏆</div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">You're invited!</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Join this group on Alboomy</p>

            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl px-5 py-4 mb-6 text-left">
              <h3 className="font-semibold text-slate-900 dark:text-white text-lg">{group.name}</h3>
              {group.description && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{group.description}</p>}
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">👥 {memberCount} member{memberCount !== 1 ? 's' : ''}</p>
            </div>

            {alreadyMember ? (
              <div>
                <p className="text-sm text-emerald-600 dark:text-emerald-400 mb-4">You're already in this group!</p>
                <Link to={`/groups/${group.id}`} className="btn-primary w-full block">View group</Link>
              </div>
            ) : !user ? (
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Create an account or sign in to join</p>
                <Link to={`/auth?redirect=/join/${code}`} className="btn-primary w-full block">Sign up to join</Link>
              </div>
            ) : (
              <button onClick={join} disabled={joining} className="btn-primary w-full flex items-center justify-center gap-2">
                {joining && <Spinner size="sm" />}
                {joining ? 'Joining…' : 'Join group'}
              </button>
            )}
          </div>
        ) : null}
      </div>
    </div>
  )
}
