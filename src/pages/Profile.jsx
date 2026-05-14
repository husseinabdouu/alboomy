import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import Tracker from '../components/Tracker'

export default function ProfilePage() {
  const { username } = useParams()
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [friendStatus, setFriendStatus] = useState(null) // null | 'pending' | 'accepted'
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    async function load() {
      // Load profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single()
      setProfile(profileData)

      // Check friendship status
      if (profileData && user) {
        const { data: fs } = await supabase
          .from('friendships')
          .select('*')
          .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
          .or(`requester_id.eq.${profileData.id},addressee_id.eq.${profileData.id}`)
        const relevant = fs?.find(f =>
          (f.requester_id === user.id && f.addressee_id === profileData.id) ||
          (f.requester_id === profileData.id && f.addressee_id === user.id)
        )
        setFriendStatus(relevant?.status ?? null)
      }
      setLoading(false)
    }
    load()
  }, [username, user])

  async function sendFriendRequest() {
    setActionLoading(true)
    await supabase.from('friendships').insert({ requester_id: user.id, addressee_id: profile.id })
    setFriendStatus('pending')
    setActionLoading(false)
  }

  if (loading) return <div className="py-12 text-center text-gray-400 text-sm">Loading…</div>
  if (!profile) return (
    <div className="py-12 text-center">
      <p className="text-gray-500">User @{username} not found.</p>
      <Link to="/friends" className="text-green-600 text-sm mt-2 inline-block">← Back to friends</Link>
    </div>
  )

  const isOwnProfile = user?.id === profile.id

  return (
    <div>
      <div className="pt-6 mb-2 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{profile.display_name || profile.username}</h1>
          <p className="text-sm text-gray-500">@{profile.username}</p>
        </div>
        {!isOwnProfile && (
          <div>
            {friendStatus === 'accepted' && (
              <span className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-full font-medium">Friends ✓</span>
            )}
            {friendStatus === 'pending' && (
              <span className="text-xs bg-gray-100 text-gray-500 px-3 py-1.5 rounded-full">Request sent</span>
            )}
            {friendStatus === null && (
              <button
                onClick={sendFriendRequest}
                disabled={actionLoading}
                className="text-sm bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-60"
              >
                {actionLoading ? '…' : 'Add friend'}
              </button>
            )}
          </div>
        )}
      </div>
      {!isOwnProfile && (
        <div className="mb-2 text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
          View-only — you can see {profile.display_name || profile.username}'s collection but not edit it.
        </div>
      )}
      <Tracker userId={profile.id} editable={isOwnProfile} />
    </div>
  )
}
