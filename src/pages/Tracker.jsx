import { useAuth } from '../contexts/AuthContext'
import Tracker from '../components/Tracker'

export default function TrackerPage() {
  const { user, profile } = useAuth()
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">My Album</h1>
        <p className="page-subtitle">@{profile?.username}</p>
      </div>
      <Tracker userId={user?.id} editable={true} />
    </div>
  )
}
