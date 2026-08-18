import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn } = useAuth()
  const from = location.state?.from?.pathname || '/dashboard'

  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await signIn(formData.email, formData.password)
      navigate(from, { replace: true })
    } catch (err) {
      const code = err?.code || ''
      if (code.includes('user-not-found') || code.includes('wrong-password') || code.includes('invalid-credential')) {
        setError('Incorrect email or password.')
      } else if (code.includes('too-many-requests')) {
        setError('Too many attempts. Please wait a moment.')
      } else if (code.includes('network-request-failed')) {
        setError('Network error — check your connection.')
      } else {
        setError('Sign-in failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-surface min-h-screen flex items-center justify-center p-md">
      {/* Compact Login Card - Modal Style */}
      <div className="w-full max-w-[420px] bg-surface-container-lowest rounded-xl shadow-lg p-lg border border-outline-variant/30">
        {/* Logo - Smaller and Compact */}
        <div className="flex flex-col items-center mb-lg">
          <div className="w-16 h-16 rounded-xl bg-primary-container/10 flex items-center justify-center mb-sm">
            <span className="material-symbols-outlined text-primary-container text-[32px]">health_metrics</span>
          </div>
          <h1 className="font-headline text-headline-lg text-on-surface text-center mb-xs">
            Welcome Back
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant text-center">
            Sign in to MedVision AI
          </p>
        </div>

        {/* Error Message - Compact */}
        {error && (
          <div className="mb-md p-sm bg-error-container/20 rounded-lg flex items-start gap-xs border border-error/20">
            <span className="material-symbols-outlined text-error text-[18px]">error</span>
            <p className="font-body-sm text-on-error-container">{error}</p>
          </div>
        )}

        {/* Login Form - Tight Spacing */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-sm w-full">
          <Input
            label="Email"
            type="email"
            name="email"
            id="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            autoComplete="email"
            required
          />

          <Input
            label="Password"
            type="password"
            name="password"
            id="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            autoComplete="current-password"
            showPasswordToggle
            required
          />

          <button
            type="button"
            onClick={() => navigate('/forgot-password')}
            className="text-sm text-primary-container hover:underline focus:outline-none text-right -mt-xs mb-xs"
          >
            Forgot password?
          </button>

          <Button type="submit" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>

          <div className="flex items-center justify-center w-full my-xs">
            <div className="h-[1px] bg-outline-variant flex-1"></div>
            <span className="px-sm text-sm text-on-surface-variant">or</span>
            <div className="h-[1px] bg-outline-variant flex-1"></div>
          </div>

          <Button variant="secondary" onClick={() => navigate('/signup')}>
            Create Account
          </Button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-on-surface-variant mt-lg">
          Secure medical imaging platform
        </p>
      </div>
    </div>
  )
}
