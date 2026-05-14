import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import AuthPage from './pages/Auth'
import TrackerPage from './pages/Tracker'
import FriendsPage from './pages/Friends'
import LeaderboardPage from './pages/Leaderboard'
import ProfilePage from './pages/Profile'
import Nav from './components/Nav'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center h-screen text-gray-400">Loading…</div>
  return user ? children : <Navigate to="/auth" replace />
}

function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Nav />
      <main className="max-w-3xl mx-auto px-4 pb-12">
        {children}
      </main>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/tracker" element={
            <PrivateRoute>
              <AppLayout><TrackerPage /></AppLayout>
            </PrivateRoute>
          } />
          <Route path="/friends" element={
            <PrivateRoute>
              <AppLayout><FriendsPage /></AppLayout>
            </PrivateRoute>
          } />
          <Route path="/leaderboard" element={
            <PrivateRoute>
              <AppLayout><LeaderboardPage /></AppLayout>
            </PrivateRoute>
          } />
          <Route path="/u/:username" element={
            <PrivateRoute>
              <AppLayout><ProfilePage /></AppLayout>
            </PrivateRoute>
          } />
          <Route path="/" element={<Navigate to="/tracker" replace />} />
          <Route path="*" element={<Navigate to="/tracker" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
