import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { firebaseRegister, firebaseGoogleLogin } from '../firebase'
import HealthMetricsForm from '../components/HealthMetricsForm'

function getStrength(password) {
  if (password.length >= 12) return 4
  if (password.length >= 9)  return 3
  if (password.length >= 6)  return 2
  if (password.length >= 1)  return 1
  return 0
}

function parseFirebaseError(err) {
  const code = err?.code || ''
  if (code.includes('email-already-in-use'))  return 'This email is already registered. Please log in.'
  if (code.includes('weak-password'))          return 'Password is too weak. Use at least 8 characters.'
  if (code.includes('invalid-email'))          return 'Invalid email address.'
  if (code.includes('network-request-failed')) return 'Network error. Check your connection.'
  return 'Unable to create account. Please try again.'
}

export default function Signup() {
  const navigate = useNavigate()
  const [fullName, setFullName]       = useState('')
  const [email, setEmail]             = useState('')
  const [password, setPassword]       = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [age, setAge]                 = useState('')
  const [bmi, setBmi]                 = useState('')
  const [sugarBeforeFast, setSugarBeforeFast] = useState('')
  const [diabetesDuration, setDiabetesDuration] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [showPassword, setShowPassword]           = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading]         = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError]             = useState('')
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const strength = useMemo(() => getStrength(password), [password])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!fullName.trim()) { setError('Full name is required'); return }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (!acceptedTerms) { setError('Please accept the Terms of Service and Privacy Policy.'); return }

    setLoading(true)
    try {
      await firebaseRegister(email, password, fullName)
      // Store optional patient profile
      localStorage.setItem('patient_profile', JSON.stringify({
        full_name:         fullName,
        email,
        age:               age ? parseInt(age) : 35,
        bmi:               bmi ? parseFloat(bmi) : 25,
        blood_sugar:       sugarBeforeFast ? parseInt(sugarBeforeFast) : 120,
        diabetes_duration: diabetesDuration ? parseInt(diabetesDuration) : 0,
      }))
      setSubmitSuccess(true)
      setTimeout(() => navigate('/dashboard', { replace: true }), 1500)
    } catch (err) {
      setError(parseFirebaseError(err))
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    setGoogleLoading(true)
    setError('')
    try {
      const user = await firebaseGoogleLogin()
      localStorage.setItem('patient_profile', JSON.stringify({
        full_name: user.displayName || '',
        email:     user.email,
      }))
      navigate('/dashboard', { replace: true })
    } catch (err) {
      if (!err?.code?.includes('popup-closed')) setError('Google sign-up failed. Please try again.')
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background-light p-4">
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-primary/10 via-background-light to-primary/5" />

      <div className="relative z-10 mx-auto w-full max-w-[520px]">
        <div className="overflow-hidden rounded-xl border border-primary/10 bg-white shadow-2xl">
          <div className="p-8">
            {/* Header */}
            <div className="mb-8 flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <span className="material-symbols-outlined text-4xl text-primary">health_metrics</span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Create Your Account</h1>
              <p className="mt-2 text-base text-slate-500">Join the AI Foot Ulcer Detection Platform</p>
            </div>

            {/* Google Sign-up */}
            <button
              type="button"
              onClick={handleGoogleSignup}
              disabled={googleLoading || loading}
              className="flex w-full items-center justify-center gap-3 rounded-lg border border-slate-200 bg-white py-3.5 font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300 disabled:opacity-60 active:scale-95 mb-5"
            >
              {googleLoading ? (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-primary" />
              ) : (
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              Continue with Google
            </button>

            <div className="relative mb-5 flex items-center">
              <div className="flex-grow border-t border-slate-200" />
              <span className="mx-4 flex-shrink text-xs font-medium uppercase tracking-widest text-slate-400">or register with email</span>
              <div className="flex-grow border-t border-slate-200" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name */}
              <div className="flex flex-col">
                <label className="mb-1.5 ml-1 text-sm font-semibold text-slate-700">Full Name</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-xl text-slate-400">person</span>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-slate-900 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/50"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="flex flex-col">
                <label className="mb-1.5 ml-1 text-sm font-semibold text-slate-700">Email Address</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-xl text-slate-400">mail</span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-slate-900 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/50"
                    placeholder="name@company.com"
                  />
                </div>
              </div>

              {/* Passwords */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex flex-col">
                  <label className="mb-1.5 ml-1 text-sm font-semibold text-slate-700">Password</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-xl text-slate-400">lock</span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-10 text-slate-900 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/50"
                      placeholder="••••••••"
                    />
                    <button type="button" onClick={() => setShowPassword((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary">
                      <span className="material-symbols-outlined text-xl">{showPassword ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>
                </div>
                <div className="flex flex-col">
                  <label className="mb-1.5 ml-1 text-sm font-semibold text-slate-700">Confirm Password</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-xl text-slate-400">shield</span>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-10 text-slate-900 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/50"
                      placeholder="••••••••"
                    />
                    <button type="button" onClick={() => setShowConfirmPassword((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary">
                      <span className="material-symbols-outlined text-xl">{showConfirmPassword ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Strength bar */}
              <div className="px-1">
                <div className="mb-1.5 flex h-1.5 gap-1">
                  {[1,2,3,4].map((bar) => (
                    <div key={bar} className={`flex-1 rounded-full ${strength >= bar ? 'bg-primary' : 'bg-slate-200'}`} />
                  ))}
                </div>
                <p className="text-[11px] font-medium text-slate-500">
                  Password Strength: <span className="text-primary">{strength >= 3 ? 'Strong' : strength >= 2 ? 'Medium' : 'Weak'}</span>
                </p>
              </div>

              {/* Health Metrics */}
              <div className="rounded-2xl bg-gradient-to-br from-primary/5 to-blue-50 border-2 border-primary/20 p-6 space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b-2 border-primary/10">
                  <div className="p-2.5 rounded-lg bg-primary/10">
                    <span className="material-symbols-outlined text-lg text-primary">favorite</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Health Metrics <span className="font-normal text-slate-500">(Optional)</span></h3>
                    <p className="text-xs text-slate-600">Used for personalised risk assessment</p>
                  </div>
                </div>
                <HealthMetricsForm
                  age={age} setAge={setAge}
                  bmi={bmi} setBmi={setBmi}
                  sugarBeforeFast={sugarBeforeFast} setSugarBeforeFast={setSugarBeforeFast}
                  compact={true}
                />
              </div>

              {/* Diabetes Duration */}
              <div className="flex flex-col">
                <label className="mb-1.5 ml-1 text-sm font-semibold text-slate-700">
                  Diabetes Duration <span className="font-normal text-slate-400">(Optional)</span>
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-xl text-slate-400">calendar_month</span>
                  <input
                    type="text"
                    value={diabetesDuration}
                    onChange={(e) => setDiabetesDuration(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-12 py-3.5 text-slate-900 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/50"
                    placeholder="e.g. 5 years"
                  />
                </div>
              </div>

              {/* Terms */}
              <div className="flex items-start gap-3 py-2">
                <input
                  id="terms"
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1 h-5 w-5 cursor-pointer rounded border-slate-300 text-primary focus:ring-primary/20"
                />
                <label htmlFor="terms" className="cursor-pointer text-sm leading-snug text-slate-600">
                  I agree to the <a className="font-medium text-primary hover:underline" href="#">Terms of Service</a> and{' '}
                  <a className="font-medium text-primary hover:underline" href="#">Privacy Policy</a> regarding medical data usage.
                </label>
              </div>

              {/* Errors / Success */}
              {error && (
                <div className="flex items-start gap-3 rounded-lg bg-red-50 border border-red-200 p-4">
                  <span className="material-symbols-outlined text-red-600 flex-shrink-0">error</span>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
              {submitSuccess && (
                <div className="flex items-start gap-3 rounded-lg bg-green-50 border border-green-200 p-4">
                  <span className="material-symbols-outlined text-green-600 flex-shrink-0">check_circle</span>
                  <p className="text-sm text-green-700">Account created! Redirecting to dashboard...</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || submitSuccess || googleLoading}
                className="relative w-full rounded-lg bg-gradient-to-r from-primary to-[#2575c0] py-4 font-bold text-white shadow-lg shadow-primary/30 transition-all hover:-translate-y-0.5 hover:shadow-primary/50 disabled:cursor-not-allowed disabled:opacity-70 flex items-center justify-center gap-2 overflow-hidden"
              >
                {loading && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />}
                <span className="relative flex items-center gap-2">
                  {loading
                    ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Creating Account...</>
                    : submitSuccess
                    ? <><span className="material-symbols-outlined">check</span> Account Created!</>
                    : <><span>Create Account</span><span className="material-symbols-outlined text-lg">arrow_forward</span></>
                  }
                </span>
              </button>
            </form>

            <div className="mt-8 border-t border-slate-100 pt-6 text-center">
              <p className="text-sm text-slate-600">
                Already have an account?
                <button type="button" onClick={() => navigate('/login')} className="ml-1 font-bold text-primary hover:underline">Log In</button>
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 bg-primary/5 px-8 py-4">
            <span className="material-symbols-outlined text-lg text-primary">verified_user</span>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary/80">Secured by Firebase Authentication</p>
          </div>
        </div>
      </div>
    </div>
  )
}
