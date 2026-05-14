import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { Spinner } from '../components/ui'

export default function AuthPage() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, signUp } = useAuth()
  const { dark, toggle } = useTheme()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    if (mode === 'login') {
      const { error } = await signIn(email, password)
      if (error) setError(error.message)
      else navigate('/tracker')
    } else {
      if (username.length < 3) { setError('Username must be at least 3 characters'); setLoading(false); return }
      if (!/^[a-z0-9_]+$/.test(username)) { setError('Only lowercase letters, numbers, and underscores allowed'); setLoading(false); return }
      const { error } = await signUp(email, password, username, displayName || username)
      if (error) setError(error.message)
      else setSuccess('Account created! Check your email to confirm, then sign in.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <span className="font-bold text-xl text-slate-900 dark:text-white">
          Alb<span className="text-brand-500">oomy</span>
        </span>
        <button
          onClick={toggle}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
        >
          {dark ? '☀️' : '🌙'}
        </button>
      </div>

      {/* Main */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              {mode === 'login' ? 'Welcome back' : 'Join Alboomy'}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              {mode === 'login'
                ? 'Sign in to track your sticker collection'
                : 'Create your account and start collecting'}
            </p>
          </div>

          <div className="card p-6">
            {/* Mode toggle */}
            <div className="flex bg-slate-100 dark:bg-slate-700 rounded-xl p-1 mb-6">
              {[['login', 'Sign in'], ['signup', 'Create account']].map(([m, label]) => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setError(''); setSuccess('') }}
                  className={`flex-1 py-2 text-sm rounded-lg transition-all ${
                    mode === m
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold shadow-sm'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <>
                  <div>
                    <label className="label">Username</label>
                    <input
                      type="text"
                      value={username}
                      onChange={e => setUsername(e.target.value.toLowerCase())}
                      placeholder="e.g. hussein"
                      required
                      className="input"
                    />
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Lowercase letters, numbers, underscores only</p>
                  </div>
                  <div>
                    <label className="label">Display name</label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={e => setDisplayName(e.target.value)}
                      placeholder="Your name"
                      className="input"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="label">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="input" />
              </div>

              <div>
                <label className="label">Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} className="input" />
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              {success && (
                <div className="bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-xl px-4 py-3">
                  <p className="text-sm text-emerald-700 dark:text-emerald-400">{success}</p>
                </div>
              )}

              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
                {loading && <Spinner size="sm" />}
                {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-6">
            Track all 992 stickers · Friends · Groups · Swap matching
          </p>
        </div>
      </div>
    </div>
  )
}
