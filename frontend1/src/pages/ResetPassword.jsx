import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const oobCode = searchParams.get('oobCode') // Firebase sends this in the email link

  const [password, setPassword]             = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword]     = useState(false)
  const [loading, setLoading]               = useState(false)
  const [error, setError]                   = useState('')
  const [success, setSuccess]               = useState(false)

  useEffect(() => {
    if (!oobCode) {
      setError('Invalid or expired reset link. Please request a new one.')
    }
  }, [oobCode])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      await axios.post(`${API_URL}/api/auth/confirm-reset`, {
        oob_code: oobCode,
        new_password: password
      })
      setSuccess(true)
    } catch (err) {
      const detail = err?.response?.data?.detail || ''
      if (detail.toLowerCase().includes('expired')) {
        setError('This reset link has expired. Please request a new one.')
      } else {
        setError(detail || 'Failed to reset password. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-4">
        <div className="w-full max-w-[400px] bg-surface-container-lowest rounded-xl border border-outline-variant p-8 flex flex-col items-center text-center shadow-sm">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-primary text-[36px]"
              style={{ fontVariationSettings: "'FILL' 1" }}>
              check_circle
            </span>
          </div>
          <h2 className="font-headline text-[20px] font-semibold text-on-surface mb-2">
            Password Reset!
          </h2>
          <p className="text-body-md text-on-surface-variant mb-6">
            Your password has been updated successfully.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full h-12 rounded-full bg-primary text-on-primary font-label-md text-[14px] hover:bg-primary/90 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-[400px] bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-outline-variant/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-[22px]">lock_reset</span>
            </div>
            <div>
              <h1 className="font-headline text-[18px] font-semibold text-on-surface">
                Set New Password
              </h1>
              <p className="text-body-sm text-[13px] text-on-surface-variant">
                MedVision AI
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-error-container/15 rounded-lg flex items-start gap-2 border border-error/15">
              <span className="material-symbols-outlined text-error text-[16px] mt-0.5">error</span>
              <p className="text-[13px] text-on-surface-variant">{error}</p>
            </div>
          )}

          {!oobCode ? (
            <div className="flex flex-col gap-4">
              <p className="text-body-md text-on-surface-variant text-center">
                This reset link is invalid or has expired.
              </p>
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full h-12 rounded-full bg-primary text-on-primary font-label-md text-[14px] hover:bg-primary/90 transition-colors"
              >
                Request New Link
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* New Password */}
              <div>
                <label className="block text-[13px] font-medium text-on-surface mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    required
                    className="w-full h-12 px-4 pr-12 rounded-lg bg-surface-container border border-outline-variant text-on-surface text-[14px] focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-[13px] font-medium text-on-surface mb-1.5">
                  Confirm Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  required
                  className="w-full h-12 px-4 rounded-lg bg-surface-container border border-outline-variant text-on-surface text-[14px] focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !oobCode}
                className="w-full h-12 rounded-full bg-primary text-on-primary font-label-md text-[14px] hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {loading ? 'Resetting…' : 'Reset Password'}
              </button>

              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="text-[13px] text-primary hover:underline text-center"
              >
                Back to Sign In
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
