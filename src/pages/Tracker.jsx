import { useAuth } from '../contexts/AuthContext'
import Tracker from '../components/Tracker'

export default function TrackerPage() {
  const { user, profile } = useAuth()

  return (
    <div>
      <div className="pt-6 mb-2">
        <h1 className="text-xl font-semibold text-gray-900">My Album</h1>
        <p className="text-sm text-gray-500">@{profile?.username}</p>
      </div>
      <Tracker userId={user?.id} editable={true} />
    </div>
  )
}
