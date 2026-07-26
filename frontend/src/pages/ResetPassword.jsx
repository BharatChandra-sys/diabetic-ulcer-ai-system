// Firebase password reset — called when user clicks the link in their email.
// Firebase embeds ?oobCode=... in the link. This page reads that code and
// calls confirmPasswordReset() — no backend token needed.
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { firebaseConfirmPasswordReset } from '../firebase'

function getStrength(password) {
  if (password.length >= 12) return 4
  if (password.length >= 9)  return 3
  if (password.length >= 6)  return 2
  if (password.length >= 1)  return 1
  return 0
}

function parseFirebaseError(err) {
  const code = err?.code || ''
  if (code.includes('expired-action-code'))  return 'This reset link has expired. Please request a new one.'
  if (code.includes('invalid-action-code'))  return 'Invalid reset link. Please request a new one.'
  if (code.includes('weak-password'))        return 'Password is too weak. Use at least 8 characters.'
  if (code.includes('user-disabled'))        return 'This account has been disabled. Contact support.'
  return 'Reset failed. Please request a new link and try again.'
}

export default function ResetPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // Firebase uses `oobCode` — our old system used `token`. Support both.
  const oobCode = searchParams.get('oobCode') || searchParams.get('token')

  const [password, setPassword]                 = useState('')
  const [confirmPassword, setConfirmPassword]   = useState('')
  const [showPassword, setShowPassword]         = useState(false)
  const [loading, setLoading]                   = useState(false)
  const [error, setError]                       = useState('')
  const [success, setSuccess]                   = useState(false)

  const strength = getStrength(password)

  useEffect(() => {
    if (!oobCode) {
      setError('Invalid or missing reset link. Please request a new one.')
    }
  }, [oobCode])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (password !== confirmPassword) { setError('Passwords do not match.'); return }
    if (password.length < 8)          { setError('Password must be at least 8 characters.'); return }
    if (!oobCode)                     { setError('Invalid reset link.'); return }

    setLoading(true)
    try {
      await firebaseConfirmPasswordReset(oobCode, password)
      setSuccess(true)
      setTimeout(() => navigate('/login', { replace: true }), 2000)
    } catch (err) {
      setError(parseFirebaseError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background-light p-4">
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/10 via-background-light to-primary/5">
        <div className="w-full max-w-md overflow-hidden rounded-xl border border-primary/10 bg-white shadow-xl shadow-primary/5">
          <div className="p-8 text-center">
            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <span className="material-symbols-outlined text-4xl text-primary">vpn_key</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Create New Password</h2>
            <p className="mt-2 text-slate-500">Choose a strong password to secure your account.</p>
          </div>

          {success ? (
            <div className="px-8 pb-8 space-y-5">
              <div className="flex flex-col items-center gap-4 rounded-xl bg-green-50 border border-green-200 p-6 text-center">
                <span className="material-symbols-outlined text-5xl text-green-600">check_circle</span>
                <div>
                  <p className="font-bold text-green-800">Password updated!</p>
                  <p className="mt-1 text-sm text-green-700">Your password has been reset successfully. Redirecting to login...</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate('/login', { replace: true })}
                className="w-full rounded-lg bg-primary py-4 font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 active:scale-95"
              >
                Go to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 px-8 pb-8 pt-2">
              {/* New password */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">New Password</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-xl text-slate-400">lock</span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-background-light py-3.5 pl-12 pr-12 text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/50"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary"
                  >
                    <span className="material-symbols-outlined text-xl">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
                {/* Strength bar */}
                {password && (
                  <div className="mt-2 px-1">
                    <div className="mb-1 flex h-1.5 gap-1">
                      {[1,2,3,4].map((bar) => (
                        <div
                          key={bar}
                          className={`flex-1 rounded-full transition-all ${
                            strength >= bar ? 'bg-primary' : 'bg-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Strength: <span className="font-semibold text-primary">
                        {strength >= 4 ? 'Strong' : strength >= 3 ? 'Good' : strength >= 2 ? 'Medium' : 'Weak'}
                      </span>
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Confirm Password</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-xl text-slate-400">shield</span>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full rounded-lg border py-3.5 pl-12 pr-4 text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:ring-2 ${
                      confirmPassword && confirmPassword !== password
                        ? 'border-red-300 focus:border-red-400 focus:ring-red-100 bg-red-50'
                        : 'border-slate-200 focus:border-primary focus:ring-primary/50 bg-background-light'
                    }`}
                    placeholder="••••••••"
                  />
                  {confirmPassword && confirmPassword === password && (
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-green-500">check_circle</span>
                  )}
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3">
                  <span className="material-symbols-outlined flex-shrink-0 text-red-600">error</span>
                  <div>
                    <p className="text-sm text-red-700">{error}</p>
                    {(error.includes('expired') || error.includes('Invalid')) && (
                      <button
                        type="button"
                        onClick={() => navigate('/forgot-password')}
                        className="mt-2 text-xs font-semibold text-primary underline"
                      >
                        Request a new link →
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !oobCode}
                className="relative flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-primary to-[#2575c0] py-4 font-bold text-white shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-primary/40 disabled:cursor-not-allowed disabled:opacity-70 active:scale-95 overflow-hidden"
              >
                {loading && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                )}
                <span className="relative flex items-center gap-2">
                  {loading ? (
                    <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Resetting...</>
                  ) : (
                    <><span className="material-symbols-outlined text-xl">lock_open</span> Reset Password</>
                  )}
                </span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full rounded-lg border border-slate-200 bg-white py-3.5 font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:border-primary hover:text-primary"
              >
                Back to Login
              </button>
            </form>
          )}

          <div className="flex items-center justify-center gap-2 border-t border-slate-100 bg-slate-50 px-8 py-4">
            <span className="material-symbols-outlined text-sm text-primary">verified_user</span>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary/80">
              Secured by Firebase Authentication
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
