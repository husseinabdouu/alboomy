import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import ImageCropModal from '../components/ImageCropModal'
import { Avatar, Toast, Spinner, EmptyState, PageLoader, ImageLightbox } from '../components/ui'
import { ALL_STICKERS, STICKER_MAP } from '../lib/stickers'

function EditProfileSection({ user, profile, updateProfile, checkUsernameAvailable }) {
  const [displayName, setDisplayName] = useState(profile?.display_name || '')
  const [username, setUsername] = useState(profile?.username || '')
  const [saving, setSaving] = useState(false)
  const [cropFile, setCropFile] = useState(null)
  const [pendingBlob, setPendingBlob] = useState(null)
  const [pendingPreview, setPendingPreview] = useState(null)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [editingPhoto, setEditingPhoto] = useState(false)
  const [removeAvatar, setRemoveAvatar] = useState(false)
  const [msg, setMsg] = useState({ text: '', type: '' })
  const fileInputRef = useRef(null)

  function handleAvatarChange(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !user?.id) return

    if (!file.type.startsWith('image/')) {
      setMsg({ text: 'Please select an image file', type: 'error' })
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setMsg({ text: 'Image must be 5MB or smaller', type: 'error' })
      return
    }

    setMsg({ text: '', type: '' })
    setRemoveAvatar(false)
    setCropFile(file)
  }

  function handleRemovePhoto() {
    if (pendingPreview) URL.revokeObjectURL(pendingPreview)
    setPendingBlob(null)
    setPendingPreview(null)
    setRemoveAvatar(true)
  }

  async function handleEditPhoto() {
    if (!profile.avatar_url) return
    setMsg({ text: '', type: '' })
    setRemoveAvatar(false)
    setEditingPhoto(true)
    try {
      const res = await fetch(profile.avatar_url)
      if (!res.ok) throw new Error('Failed to load profile photo')
      const blob = await res.blob()
      const file = new File([blob], 'avatar.jpg', { type: blob.type })
      setCropFile(file)
    } catch (err) {
      setMsg({ text: err.message || 'Failed to load profile photo', type: 'error' })
    }
    setEditingPhoto(false)
  }

  async function save(e) {
    e.preventDefault()
    setMsg({ text: '', type: '' })
    setSaving(true)

    if (username !== profile.username) {
      if (username.length < 3) { setMsg({ text: 'Username must be at least 3 characters', type: 'error' }); setSaving(false); return }
      if (!/^[a-z0-9_]+$/.test(username)) { setMsg({ text: 'Only lowercase letters, numbers, and underscores', type: 'error' }); setSaving(false); return }
      const available = await checkUsernameAvailable(username)
      if (!available) { setMsg({ text: 'Username already taken', type: 'error' }); setSaving(false); return }
    }

    const updates = { display_name: displayName, username }

    if (removeAvatar) {
      try {
        await supabase.storage.from('avatars').remove([`${user.id}/avatar.jpg`])
      } catch {
        // ignore if file doesn't exist
      }
      updates.avatar_url = null
    } else if (pendingBlob) {
      const path = `${user.id}/avatar.jpg`
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, pendingBlob, { upsert: true, contentType: 'image/jpeg' })

      if (uploadError) {
        setMsg({ text: uploadError.message, type: 'error' })
        setSaving(false)
        return
      }

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
      updates.avatar_url = `${publicUrl}?t=${Date.now()}`
    }

    const { error } = await updateProfile(updates)
    if (error) {
      setMsg({ text: error.message, type: 'error' })
    } else {
      setMsg({ text: 'Profile updated!', type: 'success' })
      if (pendingPreview) URL.revokeObjectURL(pendingPreview)
      setPendingBlob(null)
      setPendingPreview(null)
      setRemoveAvatar(false)
    }
    setSaving(false)
  }

  const avatarSrc = removeAvatar ? null : (pendingPreview || profile.avatar_url)

  return (
    <div className="card p-6">
      <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-5">Account details</h2>

      <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100 dark:border-slate-700">
        <button
          type="button"
          onClick={() => avatarSrc && setLightboxOpen(true)}
          className={`flex-shrink-0 ${avatarSrc ? 'cursor-pointer' : ''}`}
          disabled={!avatarSrc}
        >
          <Avatar
            name={profile.display_name || profile.username}
            src={avatarSrc}
            size="xl"
          />
        </button>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={saving || editingPhoto}
              className="btn-secondary"
            >
              Change photo
            </button>
            {profile.avatar_url && !pendingPreview && !removeAvatar && (
              <button
                type="button"
                onClick={handleEditPhoto}
                disabled={saving || editingPhoto}
                className="btn-secondary flex items-center gap-2"
              >
                {editingPhoto && <Spinner size="sm" />}
                {editingPhoto ? 'Loading…' : 'Edit photo'}
              </button>
            )}
          </div>
          {(profile.avatar_url || pendingPreview) && (
            <button
              type="button"
              onClick={handleRemovePhoto}
              disabled={saving || editingPhoto}
              className="text-xs text-red-500 hover:underline mt-2 disabled:opacity-50"
            >
              Remove photo
            </button>
          )}
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">JPG, PNG or GIF · max 5MB</p>
        </div>
      </div>

      {cropFile && (
        <ImageCropModal
          file={cropFile}
          onCancel={() => setCropFile(null)}
          onCropped={(blob) => {
            setRemoveAvatar(false)
            setPendingBlob(blob)
            setPendingPreview(URL.createObjectURL(blob))
            setCropFile(null)
          }}
        />
      )}

      {lightboxOpen && (
        <ImageLightbox
          src={avatarSrc}
          alt={profile.display_name || profile.username}
          onClose={() => setLightboxOpen(false)}
        />
      )}

      <form onSubmit={save} className="space-y-4">
        <div>
          <label className="label">Display name</label>
          <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} className="input" placeholder="Your name" />
        </div>
        <div>
          <label className="label">Username</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">@</span>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value.toLowerCase())}
              className="input pl-7"
              placeholder="username"
            />
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">This is how friends find you on Alboomy</p>
        </div>

        {msg.text && (
          <div className={`rounded-xl px-4 py-3 text-sm ${msg.type === 'error' ? 'bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400' : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'}`}>
            {msg.text}
          </div>
        )}

        <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
          {saving && <Spinner size="sm" />}
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </div>
  )
}

function DuplicatesSection({ userId }) {
  const [duplicates, setDuplicates] = useState([])
  const [search, setSearch] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState({ msg: '', show: false })
  const toastTimer = useState(null)[0]

  useEffect(() => {
    load()
  }, [userId])

  async function load() {
    const { data } = await supabase.from('duplicates').select('*').eq('user_id', userId)
    setDuplicates(data || [])
    setLoading(false)
  }

  function onSearch(q) {
    setSearch(q)
    if (!q.trim()) { setResults([]); return }
    const lq = q.toLowerCase()
    setResults(
      ALL_STICKERS.filter(s =>
        s.id.toLowerCase().startsWith(lq) ||
        s.label.toLowerCase().includes(lq) ||
        s.team.toLowerCase().includes(lq)
      ).slice(0, 15)
    )
  }

  function showToast(msg) {
    setToast({ msg, show: true })
    setTimeout(() => setToast(t => ({ ...t, show: false })), 2000)
  }

  async function addDuplicate(sticker) {
    const existing = duplicates.find(d => d.sticker_id === sticker.id)
    if (existing) {
      await supabase.from('duplicates').update({ quantity: existing.quantity + 1 }).eq('id', existing.id)
    } else {
      await supabase.from('duplicates').insert({ user_id: userId, sticker_id: sticker.id, quantity: 1 })
    }
    await load()
    setSearch('')
    setResults([])
    showToast(`${sticker.id} added to duplicates`)
  }

  async function removeDuplicate(dup) {
    if (dup.quantity > 1) {
      await supabase.from('duplicates').update({ quantity: dup.quantity - 1 }).eq('id', dup.id)
    } else {
      await supabase.from('duplicates').delete().eq('id', dup.id)
    }
    await load()
  }

  if (loading) return <PageLoader />

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">Duplicate stickers</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">List your spare stickers so friends can see what you have to trade</p>
        </div>
        <span className="badge-brand">{duplicates.length} listed</span>
      </div>

      {/* Search to add */}
      <div className="relative mb-4">
        <input
          type="text"
          value={search}
          onChange={e => onSearch(e.target.value)}
          placeholder="Search sticker to add as duplicate…"
          className="input"
        />
        {results.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 card shadow-modal py-1 z-20 max-h-64 overflow-y-auto">
            {results.map(s => (
              <button
                key={s.id}
                onClick={() => addDuplicate(s)}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700 text-left transition-colors"
              >
                <span className="text-xs font-bold text-slate-400 w-12">{s.id}</span>
                <span className="text-sm text-slate-700 dark:text-slate-300 flex-1">{s.label}</span>
                <span className="text-xs text-slate-400">{s.flag} {s.team}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {duplicates.length === 0 ? (
        <EmptyState icon="🔄" title="No duplicates listed" description="Add your spare stickers here so friends know what you can trade" />
      ) : (
        <div className="space-y-2">
          {duplicates.map(dup => {
            const sticker = ALL_STICKERS.find(s => s.id === dup.sticker_id)
            if (!sticker) return null
            return (
              <div key={dup.id} className="flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <span className="text-xs font-bold text-brand-500 w-12">{sticker.id}</span>
                <div className="flex-1">
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{sticker.label}</div>
                  <div className="text-xs text-slate-400">{sticker.flag} {sticker.team}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="badge-amber">×{dup.quantity}</span>
                  <button
                    onClick={() => removeDuplicate(dup)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
      <Toast message={toast.msg} visible={toast.show} />
    </div>
  )
}

export default function ProfilePage() {
  const { user, profile, updateProfile, checkUsernameAvailable } = useAuth()
  const [lightboxOpen, setLightboxOpen] = useState(false)

  if (!profile) return <PageLoader />

  return (
    <div>
      <div className="page-header">
        {/* Profile header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            type="button"
            onClick={() => profile.avatar_url && setLightboxOpen(true)}
            className={`flex-shrink-0 ${profile.avatar_url ? 'cursor-pointer' : ''}`}
            disabled={!profile.avatar_url}
          >
            <Avatar name={profile.display_name || profile.username} src={profile.avatar_url} size="xl" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {profile.display_name || profile.username}
            </h1>
            <p className="text-slate-500 dark:text-slate-400">@{profile.username}</p>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">{user?.email}</p>
          </div>
        </div>
      </div>

      {lightboxOpen && (
        <ImageLightbox
          src={profile.avatar_url}
          alt={profile.display_name || profile.username}
          onClose={() => setLightboxOpen(false)}
        />
      )}

      <div className="space-y-5 pb-20 sm:pb-0">
        <EditProfileSection
          user={user}
          profile={profile}
          updateProfile={updateProfile}
          checkUsernameAvailable={checkUsernameAvailable}
        />
        <DuplicatesSection userId={user?.id} />

        {/* Danger zone */}
        <div className="card p-6 border-red-200 dark:border-red-900">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-1">Account info</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Signed in as <span className="font-medium text-slate-700 dark:text-slate-300">{user?.email}</span>
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Member since {new Date(user?.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
          </p>
        </div>
      </div>
    </div>
  )
}
