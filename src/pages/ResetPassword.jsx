import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { supabase } from '../lib/supabase'
import { Spinner } from '../components/ui'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [linkValid, setLinkValid] = useState(false)
  const [checking, setChecking] = useState(true)
  const { updatePassword } = useAuth()
  const { dark, toggle } = useTheme()
  const navigate = useNavigate()

  useEffect(() => {
    let mounted = true

    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession()
      if (mounted && session) setLinkValid(true)
      if (mounted) setChecking(false)
    }

    checkSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || session) {
        setLinkValid(true)
        setChecking(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    const { error } = await updatePassword(password)
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    setSuccess(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <div className="flex items-center justify-between px-6 py-4">
        <span className="font-bold text-xl text-brand-500">
          Alboomy
        </span>
        <button
          onClick={toggle}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
        >
          {dark ? '☀️' : '🌙'}
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Reset password
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Choose a new password for your account
            </p>
          </div>

          <div className="card p-6">
            {checking ? (
              <div className="flex items-center justify-center py-8">
                <Spinner />
              </div>
            ) : !linkValid ? (
              <div className="text-center space-y-4">
                <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
                  <p className="text-sm text-red-600 dark:text-red-400">
                    This reset link is invalid or has expired. Please request a new one.
                  </p>
                </div>
                <button onClick={() => navigate('/auth')} className="btn-primary w-full">
                  Back to sign in
                </button>
              </div>
            ) : success ? (
              <div className="text-center space-y-4">
                <div className="bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-xl px-4 py-3">
                  <p className="text-sm text-emerald-700 dark:text-emerald-400">
                    Your password has been updated successfully.
                  </p>
                </div>
                <button onClick={() => navigate('/auth')} className="btn-primary w-full">
                  Sign in
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">New password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="input"
                  />
                </div>

                <div>
                  <label className="label">Confirm password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    className="input"
                  />
                </div>

                {error && (
                  <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  </div>
                )}

                <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
                  {loading && <Spinner size="sm" />}
                  {loading ? 'Please wait…' : 'Update password'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
