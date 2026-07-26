import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { firebaseForgotPassword } from '../firebase'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')
  const [success, setSuccess] = useState(false)

  function parseFirebaseError(err) {
    const code = err?.code || ''
    if (code.includes('user-not-found'))         return null // silent — don't reveal
    if (code.includes('invalid-email'))          return 'Invalid email address.'
    if (code.includes('network-request-failed')) return 'Network error. Check your connection.'
    return 'Unable to send reset email. Please try again.'
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      await firebaseForgotPassword(email)
      setSuccess(true)           // Firebase sends the email automatically
    } catch (err) {
      const msg = parseFirebaseError(err)
      // For user-not-found we still show the success state (security best practice)
      if (!msg) { setSuccess(true) } else { setError(msg) }
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
              <span className="material-symbols-outlined text-4xl text-primary">lock_reset</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Forgot Password</h2>
            <p className="mt-2 text-slate-500">
              Enter your email and we&apos;ll send a reset link instantly.
            </p>
          </div>

          {success ? (
            <div className="px-8 pb-8 space-y-5">
              <div className="flex flex-col items-center gap-4 rounded-xl bg-green-50 border border-green-200 p-6 text-center">
                <span className="material-symbols-outlined text-5xl text-green-600">mark_email_read</span>
                <div>
                  <p className="font-bold text-green-800">Check your inbox</p>
                  <p className="mt-1 text-sm text-green-700">
                    A password reset link has been sent to <strong>{email}</strong>.
                    Check your spam folder if it doesn&apos;t arrive within a minute.
                  </p>
                </div>
              </div>
              <p className="text-center text-xs text-slate-400">
                The link expires in <strong>1 hour</strong>. Powered by Firebase.
              </p>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full rounded-lg bg-primary py-4 font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 active:scale-95"
              >
                Back to Login
              </button>
              <button
                type="button"
                onClick={() => { setSuccess(false); setEmail('') }}
                className="w-full rounded-lg border border-slate-200 bg-white py-3.5 font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Use a different email
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 px-8 pb-8 pt-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Email Address</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-xl text-slate-400">
                    mail
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-background-light py-3.5 pl-12 pr-4 text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/50"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3">
                  <span className="material-symbols-outlined flex-shrink-0 text-red-600">error</span>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="relative flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-primary to-[#2575c0] py-4 font-bold text-white shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-primary/40 disabled:cursor-not-allowed disabled:opacity-70 active:scale-95 overflow-hidden"
              >
                {loading && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                )}
                <span className="relative flex items-center gap-2">
                  {loading ? (
                    <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Sending...</>
                  ) : (
                    <><span className="material-symbols-outlined text-xl">send</span> Send Reset Link</>
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
