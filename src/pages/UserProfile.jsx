import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Avatar, ProgressBar, EmptyState, PageLoader, Toast, Spinner, ImageLightbox } from '../components/ui'
import Tracker from '../components/Tracker'
import { TOTAL_STICKERS, ALL_STICKERS } from '../lib/stickers'

export default function UserProfilePage() {
  const { username } = useParams()
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [collectionCount, setCollectionCount] = useState(0)
  const [duplicates, setDuplicates] = useState([])
  const [friendStatus, setFriendStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('album')
  const [toast, setToast] = useState({ msg: '', show: false })
  const [lightboxOpen, setLightboxOpen] = useState(false)

  useEffect(() => {
    if (username) load()
  }, [username, user])

  async function load() {
    const { data: p } = await supabase.from('profiles').select('*').eq('username', username).single()
    if (!p) { setLoading(false); return }
    setProfile(p)

    const [colRes, dupRes] = await Promise.all([
      supabase.from('collections').select('sticker_id', { count: 'exact', head: true }).eq('user_id', p.id),
      supabase.from('duplicates').select('*').eq('user_id', p.id),
    ])
    setCollectionCount(colRes.count || 0)
    setDuplicates(dupRes.data || [])

    if (user && user.id !== p.id) {
      const { data: fs } = await supabase.from('friendships').select('*')
        .or(`and(requester_id.eq.${user.id},addressee_id.eq.${p.id}),and(requester_id.eq.${p.id},addressee_id.eq.${user.id})`)
        .maybeSingle()
      setFriendStatus(fs?.status ?? null)
    }

    setLoading(false)
  }

  async function sendFriendRequest() {
    setActionLoading(true)
    await supabase.from('friendships').insert({ requester_id: user.id, addressee_id: profile.id })
    setFriendStatus('pending')
    setActionLoading(false)
    setToast({ msg: 'Friend request sent!', show: true })
    setTimeout(() => setToast(t => ({ ...t, show: false })), 2000)
  }

  if (loading) return <PageLoader />

  if (!profile) return (
    <div className="py-20 text-center">
      <div className="text-4xl mb-4">🔍</div>
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">User not found</h2>
      <p className="text-slate-500 dark:text-slate-400 text-sm mb-5">@{username} doesn't exist on Alboomy</p>
      <Link to="/friends" className="btn-primary">Back to friends</Link>
    </div>
  )

  const isOwnProfile = user?.id === profile.id
  const pct = Math.round(collectionCount / TOTAL_STICKERS * 100)

  return (
    <div className="pb-20 sm:pb-0">
      {/* Profile header */}
      <div className="page-header">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => profile.avatar_url && setLightboxOpen(true)}
              className={`flex-shrink-0 ${profile.avatar_url ? 'cursor-pointer' : ''}`}
              disabled={!profile.avatar_url}
            >
              <Avatar name={profile.display_name || profile.username} src={profile.avatar_url} size="xl" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                {profile.display_name || profile.username}
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">@{profile.username}</p>
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-brand-600 dark:text-brand-400">{collectionCount}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">stickers · {pct}%</span>
                </div>
                <ProgressBar value={collectionCount} max={TOTAL_STICKERS} className="w-24" size="sm" />
              </div>
            </div>
          </div>

          {!isOwnProfile && user && (
            <div className="flex-shrink-0">
              {friendStatus === 'accepted' && <span className="badge-green">Friends ✓</span>}
              {friendStatus === 'pending' && <span className="badge-slate">Request sent</span>}
              {friendStatus === null && (
                <button onClick={sendFriendRequest} disabled={actionLoading} className="btn-primary text-sm flex items-center gap-1.5">
                  {actionLoading ? <Spinner size="sm" /> : null}
                  Add friend
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {!isOwnProfile && (
        <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3 mb-5 text-sm text-amber-700 dark:text-amber-400">
          View-only — you're looking at {profile.display_name || profile.username}'s collection
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-700 mb-5">
        {[['album', 'Album'], ['duplicates', `Duplicates (${duplicates.length})`]].map(([tab, label]) => (
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

      {activeTab === 'album' && <Tracker userId={profile.id} editable={isOwnProfile} />}

      {activeTab === 'duplicates' && (
        duplicates.length === 0 ? (
          <EmptyState icon="🔄" title="No duplicates listed" description={`${profile.display_name || profile.username} hasn't listed any spare stickers yet`} />
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              Stickers {profile.display_name || profile.username} has spare and can trade:
            </p>
            {duplicates.map(dup => {
              const sticker = ALL_STICKERS.find(s => s.id === dup.sticker_id)
              if (!sticker) return null
              return (
                <div key={dup.id} className="card p-4 flex items-center gap-3">
                  <span className="text-xs font-bold text-brand-500 w-14 flex-shrink-0">{sticker.id}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{sticker.label}</div>
                    <div className="text-xs text-slate-400">{sticker.flag} {sticker.team}</div>
                  </div>
                  <span className="badge-amber">×{dup.quantity}</span>
                </div>
              )
            })}
          </div>
        )
      )}

      {lightboxOpen && (
        <ImageLightbox
          src={profile.avatar_url}
          alt={profile.display_name || profile.username}
          onClose={() => setLightboxOpen(false)}
        />
      )}

      <Toast message={toast.msg} visible={toast.show} />
    </div>
  )
}
