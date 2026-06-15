import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import Nav from './components/Nav'
import AuthPage from './pages/Auth'
import ResetPasswordPage from './pages/ResetPassword'
import TrackerPage from './pages/Tracker'
import FriendsPage from './pages/Friends'
import GroupsPage from './pages/Groups'
import GroupDetailPage from './pages/GroupDetail'
import JoinGroupPage from './pages/JoinGroup'
import ProfilePage from './pages/Profile'
import UserProfilePage from './pages/UserProfile'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-8 h-8 animate-spin rounded-full border-2 border-slate-200 dark:border-slate-700 border-t-brand-500" />
    </div>
  )
  return user ? children : <Navigate to="/auth" replace />
}

function AppLayout({ children }) {
  return (
    <div className="min-h-screen">
      <Nav />
      <main className="max-w-3xl mx-auto px-4 pb-24 sm:pb-8">
        {children}
      </main>
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/join/:code" element={<JoinGroupPage />} />

            {/* Private */}
            <Route path="/tracker" element={<PrivateRoute><AppLayout><TrackerPage /></AppLayout></PrivateRoute>} />
            <Route path="/friends" element={<PrivateRoute><AppLayout><FriendsPage /></AppLayout></PrivateRoute>} />
            <Route path="/groups" element={<PrivateRoute><AppLayout><GroupsPage /></AppLayout></PrivateRoute>} />
            <Route path="/groups/:id" element={<PrivateRoute><AppLayout><GroupDetailPage /></AppLayout></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><AppLayout><ProfilePage /></AppLayout></PrivateRoute>} />
            <Route path="/u/:username" element={<PrivateRoute><AppLayout><UserProfilePage /></AppLayout></PrivateRoute>} />

            {/* Redirects */}
            <Route path="/" element={<Navigate to="/tracker" replace />} />
            <Route path="*" element={<Navigate to="/tracker" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
