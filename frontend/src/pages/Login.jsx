import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { firebaseLogin, firebaseGoogleLogin } from '../firebase'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/dashboard'

  const [email, setEmail] = useState(localStorage.getItem('remember_email') || '')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [rememberMe, setRememberMe] = useState(!!localStorage.getItem('remember_email'))

  function parseError(err) {
    const c = err?.code || ''
    if (c.includes('user-not-found') || c.includes('wrong-password') || c.includes('invalid-credential'))
      return 'Incorrect email or password.'
    if (c.includes('too-many-requests'))
      return 'Too many attempts. Please wait a moment.'
    if (c.includes('network-request-failed'))
      return 'Network error — check your connection.'
    return 'Sign-in failed. Please try again.'
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await firebaseLogin(email, password)
      rememberMe
        ? localStorage.setItem('remember_email', email)
        : localStorage.removeItem('remember_email')
      navigate(from, { replace: true })
    } catch (err) {
      setError(parseError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-surface text-on-surface font-body-md min-h-screen flex flex-col">
      <main className="flex-1 flex flex-col w-full h-full min-h-screen items-center justify-center py-lg px-md bg-surface">
        <div className="w-full max-w-container bg-surface-container-lowest rounded-xl shadow-lg flex flex-col p-md md:p-lg">
          {/* Logo and Title */}
          <div className="flex flex-col items-center mb-lg">
            <img
              alt="MedVision AI logo"
              className="w-24 h-24 object-contain mb-md rounded-md"
              src="https://lh3.googleusercontent.com/aida/AP1WRLtPhFC4UXGrBEfVYI_xJgb2ekO8uk4UTzjUSqbH-e7jh7iHcRp3oRC9NeY2aVIb9ANHyG-4TIfeLhGUOc-jPxuqZuEZrchuPLi9kKfmbLhmCLTg-1Yq1R7wqkxncx9_JdoiGXQPX8T4TcBubjkBuzg_lioaomAe5qopKu-8ePyeWu8vlYxsCnuc7MmeZI5ivEfwAr4YPDWimz_v4BtcvKqiLNWH7RoFnwOqQ5BpMKJ1KVVmqA3GH_OfqJo"
            />
            <h1 className="font-headline-xl text-headline-xl-mobile text-primary-container text-center mb-xs">
              MedVision AI
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant text-center">
              Track your foot health, simply.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-md p-md bg-error-container rounded-xl flex items-start gap-sm border border-error/20">
              <span className="material-symbols-outlined text-error text-[20px]">error</span>
              <p className="font-body-md text-body-md text-on-error-container">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-md w-full">
            <Input
              label="Email Address"
              type="email"
              name="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />

            <Input
              label="Password"
              type="password"
              name="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              showPasswordToggle
              required
            />

            <Link
              to="/forgot-password"
              className="h-touch-target-min flex items-center self-start font-label-md text-label-md text-primary-container hover:underline focus:outline-none focus:ring-2 focus:ring-primary-container rounded-sm px-xs -ml-xs"
            >
              Forgot password?
            </Link>

            <Button type="submit" disabled={loading} className="mt-sm">
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>

            <div className="flex items-center justify-center w-full my-sm">
              <div className="h-[1px] bg-surface-variant flex-1"></div>
              <span className="px-sm font-body-md text-body-md text-on-surface-variant">or</span>
              <div className="h-[1px] bg-surface-variant flex-1"></div>
            </div>

            <Button variant="secondary" onClick={() => navigate('/signup')}>
              Create Account
            </Button>
          </form>
        </div>
      </main>
    </div>
  )
}
