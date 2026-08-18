import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'

export default function Signup() {
  const navigate = useNavigate()
  const { signUp } = useAuth()

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)

  const calculatePasswordStrength = (password) => {
    let strength = 0
    if (password.length > 0) strength += 1
    if (password.length >= 8) strength += 1
    if (/[A-Z]/.test(password) && /[0-9]/.test(password)) strength += 1
    return strength
  }

  const getStrengthLabel = () => {
    switch (passwordStrength) {
      case 0: return 'Weak'
      case 1: return 'Weak'
      case 2: return 'Good'
      case 3: return 'Strong'
      default: return 'Weak'
    }
  }

  const getStrengthColor = () => {
    switch (passwordStrength) {
      case 0: return 'bg-error'
      case 1: return 'bg-error'
      case 2: return 'bg-tertiary'
      case 3: return 'bg-primary'
      default: return 'bg-error'
    }
  }

  const getStrengthWidth = () => {
    switch (passwordStrength) {
      case 0: return 'w-0'
      case 1: return 'w-[33%]'
      case 2: return 'w-[66%]'
      case 3: return 'w-full'
      default: return 'w-0'
    }
  }

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value
    setFormData({ ...formData, password: newPassword })
    setPasswordStrength(calculatePasswordStrength(newPassword))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.fullName.trim()) {
      setError('Full name is required.')
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (!formData.agreeToTerms) {
      setError('You must agree to the Terms of Service and Privacy Policy.')
      return
    }

    setLoading(true)

    try {
      await signUp(formData.email, formData.password, formData.fullName)
      navigate('/dashboard')
    } catch (err) {
      const code = err?.code || ''
      if (code.includes('email-already-in-use')) {
        setError('This email is already registered.')
      } else if (code.includes('weak-password')) {
        setError('Password is too weak. Try adding numbers and uppercase letters.')
      } else if (code.includes('invalid-email')) {
        setError('Invalid email address.')
      } else {
        setError('Account creation failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-surface min-h-screen flex items-center justify-center p-md">
      {/* Signup Card */}
      <div className="w-full max-w-[480px] bg-surface-container-lowest rounded-xl shadow-lg p-md md:p-lg border border-outline-variant/30">
        {/* Header */}
        <div className="flex flex-col items-center gap-xs text-center pb-sm mb-lg">
          <div className="w-16 h-16 rounded-xl bg-primary-container/10 flex items-center justify-center mb-sm">
            <span className="material-symbols-outlined text-primary-container text-[32px]">person_add</span>
          </div>
          <h1 className="font-headline text-headline-xl-mobile md:text-headline-xl text-on-surface">
            Create Account
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Set up your secure MedVision AI patient profile.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-md p-sm bg-error-container/20 rounded-lg flex items-start gap-xs border border-error/20">
            <span className="material-symbols-outlined text-error text-[18px]">error</span>
            <p className="font-body-sm text-on-error-container">{error}</p>
          </div>
        )}

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-md">
          {/* Full Name */}
          <div className="flex flex-col gap-xs">
            <label className="font-label-md text-label-md text-on-surface" htmlFor="fullName">
              Full Name
            </label>
            <input
              className="h-[56px] px-md rounded-lg border border-outline-variant bg-surface-container-lowest font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              id="fullName"
              type="text"
              placeholder="Jane Doe"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              required
            />
            <p className="font-body-md text-[14px] leading-[20px] text-on-surface-variant">
              Use the name exactly as it appears on your medical records.
            </p>
          </div>

          {/* Email */}
          <div className="flex flex-col gap-xs">
            <label className="font-label-md text-label-md text-on-surface" htmlFor="email">
              Email Address
            </label>
            <input
              className="h-[56px] px-md rounded-lg border border-outline-variant bg-surface-container-lowest font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              id="email"
              type="email"
              placeholder="jane.doe@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              autoComplete="email"
              required
            />
            <p className="font-body-md text-[14px] leading-[20px] text-on-surface-variant">
              We'll use this for important health updates and notifications.
            </p>
          </div>

          {/* Password with Strength Meter */}
          <div className="flex flex-col gap-xs">
            <label className="font-label-md text-label-md text-on-surface" htmlFor="password">
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handlePasswordChange}
              autoComplete="new-password"
              showPasswordToggle
              required
            />
            <div className="flex flex-col gap-2 pt-1">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 rounded-full bg-surface-container-highest overflow-hidden">
                  <div 
                    className={`h-full ${getStrengthWidth()} ${getStrengthColor()} transition-all duration-300`}
                  />
                </div>
                <span className="font-label-md text-[14px] leading-[20px] text-on-surface-variant w-[60px] text-right">
                  {getStrengthLabel()}
                </span>
              </div>
              <p className="font-body-md text-[14px] leading-[20px] text-on-surface-variant">
                Must be at least 8 characters long.
              </p>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col gap-xs">
            <label className="font-label-md text-label-md text-on-surface" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              autoComplete="new-password"
              showPasswordToggle
              required
            />
          </div>

          {/* Terms Checkbox */}
          <div className="flex items-start gap-sm pt-sm pb-md">
            <div className="relative flex items-center justify-center min-w-[48px] min-h-[48px] -ml-sm -mt-sm">
              <input
                className="appearance-none w-6 h-6 border-2 border-outline rounded bg-surface-container-lowest checked:bg-primary checked:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all cursor-pointer peer"
                id="terms"
                type="checkbox"
                checked={formData.agreeToTerms}
                onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
              />
              <span 
                className="material-symbols-outlined absolute text-on-primary text-[18px] pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                check
              </span>
            </div>
            <label className="font-body-md text-body-md text-on-surface-variant pt-2 cursor-pointer" htmlFor="terms">
              I agree to the{' '}
              <a className="text-primary font-bold hover:underline" href="#">
                Terms of Service
              </a>{' '}
              and{' '}
              <a className="text-primary font-bold hover:underline" href="#">
                Privacy Policy
              </a>.
            </label>
          </div>

          {/* Submit Button */}
          <button
            className="h-[56px] w-full bg-primary text-on-primary font-label-md text-label-md rounded-lg hover:bg-primary/90 active:bg-primary-container transition-colors shadow-sm flex items-center justify-center gap-xs disabled:opacity-50 disabled:cursor-not-allowed"
            type="submit"
            disabled={loading}
          >
            <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
            {!loading && <span className="material-symbols-outlined text-[20px]">arrow_forward</span>}
          </button>
        </form>

        {/* Footer - Sign In Link */}
        <div className="flex justify-center pt-md border-t border-outline-variant/30 mt-lg">
          <button
            onClick={() => navigate('/login')}
            className="h-[48px] px-md flex items-center justify-center font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors"
          >
            Already have an account?{' '}
            <span className="text-primary font-bold ml-1">Sign In</span>
          </button>
        </div>
      </div>
    </div>
  )
}
