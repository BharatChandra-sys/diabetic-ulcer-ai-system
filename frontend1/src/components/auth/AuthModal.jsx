import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import Input from '../ui/Input'
import Button from '../ui/Button'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

export default function AuthModal({ isOpen, onClose, initialMode = 'login', redirectAfterLogin }) {
  const { signIn, signUp, forgotPassword, signInWithGoogle } = useAuth()

  const [mode, setMode] = useState(initialMode)
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '', confirmPassword: '', otp: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [resetEmailSent, setResetEmailSent] = useState(false)
  const [otpVerified, setOtpVerified] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode)
      setError('')
      setFormData({ fullName: '', email: '', password: '', confirmPassword: '', otp: '' })
      setResetEmailSent(false)
      setOtpVerified(false)
    }
  }, [isOpen, initialMode])

  // Google Sign-In initialization
  useEffect(() => {
    if (!isOpen || !GOOGLE_CLIENT_ID || (mode !== 'login' && mode !== 'signup')) return

    const initGoogle = () => {
      if (window.googleAuthReady) return
      
      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (response) => {
            setLoading(true)
            setError('')
            try {
              await signInWithGoogle(response.credential)
              setLoading(false)
              onClose()
              if (redirectAfterLogin) setTimeout(() => window.location.href = redirectAfterLogin, 50)
            } catch (err) {
              setLoading(false)
              setError(err?.response?.data?.detail || 'Google sign-in failed.')
            }
          },
        })

        const btnId = 'google-btn-' + mode
        const container = document.getElementById(btnId)
        if (container && !container.hasChildNodes()) {
          window.google.accounts.id.renderButton(container, {
            theme: 'outline',
            size: 'large',
            width: container.offsetWidth || 360,
            text: 'continue_with',
            shape: 'rectangular',
          })
        }
        window.googleAuthReady = true
      } catch (err) {
        console.error('Google init error:', err)
      }
    }

    const timer = setTimeout(() => {
      if (window.google?.accounts?.id) {
        initGoogle()
      } else if (!document.querySelector('script[src*="accounts.google.com/gsi/client"]')) {
        const script = document.createElement('script')
        script.src = 'https://accounts.google.com/gsi/client'
        script.async = true
        script.defer = true
        script.onload = initGoogle
        document.head.appendChild(script)
      }
    }, 200)

    return () => {
      clearTimeout(timer)
      window.googleAuthReady = false
    }
  }, [isOpen, mode])

  const calcStrength = (pw) => {
    let s = 0
    if (pw.length > 0) s++
    if (pw.length >= 8) s++
    if (/[A-Z]/.test(pw) && /[0-9]/.test(pw)) s++
    return s
  }

  const handlePasswordChange = (e) => {
    const v = e.target.value
    setFormData(f => ({ ...f, password: v }))
    setPasswordStrength(calcStrength(v))
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn(formData.email, formData.password)
      setLoading(false)
      onClose()
      if (redirectAfterLogin) setTimeout(() => window.location.href = redirectAfterLogin, 50)
    } catch (err) {
      setLoading(false)
      const detail = err?.response?.data?.detail || ''
      if (detail.toLowerCase().includes('invalid') || detail.toLowerCase().includes('password')) {
        setError('Incorrect email or password.')
      } else {
        setError(detail || 'Sign-in failed.')
      }
    }
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    setError('')
    if (!formData.fullName.trim()) { setError('Full name is required.'); return }
    if (formData.password.length < 6) { setError('Password must be at least 6 characters.'); return }
    if (formData.password !== formData.confirmPassword) { setError('Passwords do not match.'); return }

    setLoading(true)
    try {
      await signUp(formData.email, formData.password, formData.fullName)
      setLoading(false)
      onClose()
      if (redirectAfterLogin) setTimeout(() => window.location.href = redirectAfterLogin, 50)
    } catch (err) {
      setLoading(false)
      const detail = err?.response?.data?.detail || ''
      if (detail.toLowerCase().includes('already')) {
        setError('This email is already registered.')
      } else {
        setError(detail || 'Account creation failed.')
      }
    }
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await forgotPassword(formData.email)
      setResetEmailSent(true)
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to send reset code.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setError('')
    if (!formData.otp || formData.otp.length !== 6) {
      setError('Enter the 6-digit code from your email.')
      return
    }
    setLoading(true)
    try {
      const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
      const { default: axios } = await import('axios')
      await axios.post(`${API_URL}/api/auth/verify-otp`, { email: formData.email, otp: formData.otp })
      setOtpVerified(true)
    } catch (err) {
      setError(err?.response?.data?.detail || 'Invalid or expired code.')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setError('')
    if (formData.password.length < 6) { setError('Password must be at least 6 characters.'); return }
    if (formData.password !== formData.confirmPassword) { setError('Passwords do not match.'); return }
    setLoading(true)
    try {
      const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
      const { default: axios } = await import('axios')
      await axios.post(`${API_URL}/api/auth/reset-with-otp`, {
        email: formData.email,
        otp: formData.otp,
        new_password: formData.password
      })
      setMode('login')
      setError('')
      setResetEmailSent(false)
      setOtpVerified(false)
      setFormData(f => ({ ...f, password: '', confirmPassword: '', otp: '' }))
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to reset password.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn" onClick={handleBackdropClick}>
      <div className="w-full max-w-[400px] bg-surface rounded-lg shadow-xl border border-outline-variant/20 animate-slideUp max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-surface/98 backdrop-blur-sm border-b border-outline-variant/10 px-4 py-3 flex justify-between items-center">
          <h2 className="font-headline text-[17px] font-semibold text-on-surface">
            {mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Reset Password'}
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-surface-container transition-colors flex items-center justify-center" aria-label="Close">
            <span className="material-symbols-outlined text-on-surface text-[20px]">close</span>
          </button>
        </div>

        <div className="p-5">
          <div className="flex flex-col items-center mb-5">
            <div className="w-12 h-12 rounded-lg bg-primary/8 flex items-center justify-center mb-2">
              <span className="material-symbols-outlined text-primary text-[24px]">
                {mode === 'login' ? 'login' : mode === 'signup' ? 'person_add' : 'lock_reset'}
              </span>
            </div>
            <p className="font-body-sm text-[13px] text-on-surface-variant text-center">
              {mode === 'login' ? 'Sign in to your account' : mode === 'signup' ? 'Create your secure account' : 'Reset your password'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-error-container/15 rounded-lg flex items-start gap-2 border border-error/15">
              <span className="material-symbols-outlined text-error text-[16px] mt-0.5">error</span>
              <p className="font-body-sm text-on-error-container text-[13px]">{error}</p>
            </div>
          )}

          {mode === 'login' && (
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <Input label="Email" type="email" value={formData.email} onChange={e => setFormData(f => ({ ...f, email: e.target.value }))} required />
              <Input label="Password" type="password" value={formData.password} onChange={e => setFormData(f => ({ ...f, password: e.target.value }))} showPasswordToggle required />
              <button type="button" onClick={() => setMode('forgot')} className="text-sm text-primary hover:underline text-right -mt-2">Forgot password?</button>
              <Button type="submit" disabled={loading}>{loading ? 'Signing In…' : 'Sign In'}</Button>
              
              <div className="flex items-center gap-3 my-1">
                <div className="flex-1 h-px bg-outline-variant" />
                <span className="text-[12px] text-on-surface-variant">or</span>
                <div className="flex-1 h-px bg-outline-variant" />
              </div>
              <div id="google-btn-login" className="w-full flex justify-center min-h-[44px]"></div>

              <div className="text-center text-sm text-on-surface-variant mt-1">
                Don't have an account? <button type="button" onClick={() => setMode('signup')} className="text-primary font-semibold hover:underline">Sign Up</button>
              </div>
            </form>
          )}

          {mode === 'signup' && (
            <form onSubmit={handleSignup} className="flex flex-col gap-4">
              <Input label="Full Name" type="text" value={formData.fullName} onChange={e => setFormData(f => ({ ...f, fullName: e.target.value }))} required />
              <Input label="Email" type="email" value={formData.email} onChange={e => setFormData(f => ({ ...f, email: e.target.value }))} required />
              <div>
                <Input label="Password" type="password" value={formData.password} onChange={handlePasswordChange} showPasswordToggle required />
                {formData.password && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-surface-container-highest overflow-hidden">
                      <div className={`h-full transition-all duration-300 ${passwordStrength === 1 ? 'w-[33%] bg-error' : passwordStrength === 2 ? 'w-[66%] bg-tertiary' : passwordStrength === 3 ? 'w-full bg-primary' : 'w-0'}`} />
                    </div>
                    <span className="text-xs text-on-surface-variant w-16 text-right">
                      {passwordStrength <= 1 ? 'Weak' : passwordStrength === 2 ? 'Good' : 'Strong'}
                    </span>
                  </div>
                )}
              </div>
              <Input label="Confirm Password" type="password" value={formData.confirmPassword} onChange={e => setFormData(f => ({ ...f, confirmPassword: e.target.value }))} showPasswordToggle required />
              <Button type="submit" disabled={loading}>{loading ? 'Creating Account…' : 'Create Account'}</Button>
              
              <div className="flex items-center gap-3 my-1">
                <div className="flex-1 h-px bg-outline-variant" />
                <span className="text-[12px] text-on-surface-variant">or</span>
                <div className="flex-1 h-px bg-outline-variant" />
              </div>
              <div id="google-btn-signup" className="w-full flex justify-center min-h-[44px]"></div>

              <div className="text-center text-sm text-on-surface-variant mt-1">
                Already have an account? <button type="button" onClick={() => setMode('login')} className="text-primary font-semibold hover:underline">Sign In</button>
              </div>
            </form>
          )}

          {mode === 'forgot' && !resetEmailSent && (
            <form onSubmit={handleForgotPassword} className="flex flex-col gap-4">
              <p className="text-body-md text-on-surface-variant mb-2">Enter your email and we'll send a 6-digit reset code.</p>
              <Input label="Email" type="email" value={formData.email} onChange={e => setFormData(f => ({ ...f, email: e.target.value }))} required />
              <Button type="submit" disabled={loading}>{loading ? 'Sending…' : 'Send Reset Code'}</Button>
              <button type="button" onClick={() => setMode('login')} className="text-sm text-primary hover:underline text-center">Back to Sign In</button>
            </form>
          )}

          {mode === 'forgot' && resetEmailSent && !otpVerified && (
            <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
              <div className="flex flex-col items-center text-center mb-2">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                  <span className="material-symbols-outlined text-primary text-[24px]">mark_email_read</span>
                </div>
                <p className="text-[14px] text-on-surface font-medium">Check your email</p>
                <p className="text-[13px] text-on-surface-variant mt-1">We sent a 6-digit code to <strong>{formData.email}</strong></p>
              </div>
              <div>
                <label className="block text-[13px] font-medium text-on-surface mb-1.5">6-digit code</label>
                <input type="text" inputMode="numeric" maxLength={6} value={formData.otp} onChange={e => setFormData(f => ({ ...f, otp: e.target.value.replace(/\D/g, '') }))} placeholder="000000" className="w-full h-12 px-4 rounded-lg bg-surface-container border border-outline-variant text-on-surface text-[22px] font-mono tracking-[0.5em] text-center focus:outline-none focus:ring-2 focus:ring-primary transition-all" required />
              </div>
              <Button type="submit" disabled={loading || formData.otp.length !== 6}>{loading ? 'Verifying…' : 'Verify Code'}</Button>
              <button type="button" onClick={() => { setResetEmailSent(false); setError('') }} className="text-sm text-primary hover:underline text-center">Resend code</button>
            </form>
          )}

          {mode === 'forgot' && resetEmailSent && otpVerified && (
            <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
              <div className="flex items-center gap-2 mb-2 p-3 bg-primary/8 rounded-lg">
                <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                <p className="text-[13px] text-primary font-medium">Code verified! Set your new password.</p>
              </div>
              <Input label="New Password" type="password" value={formData.password} onChange={handlePasswordChange} showPasswordToggle required />
              <Input label="Confirm Password" type="password" value={formData.confirmPassword} onChange={e => setFormData(f => ({ ...f, confirmPassword: e.target.value }))} showPasswordToggle required />
              <Button type="submit" disabled={loading}>{loading ? 'Resetting…' : 'Reset Password'}</Button>
            </form>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px) } to { opacity: 1; transform: translateY(0) } }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out }
        .animate-slideUp { animation: slideUp 0.3s ease-out }
      `}</style>
    </div>
  )
}
