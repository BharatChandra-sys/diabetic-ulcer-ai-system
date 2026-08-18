import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '../firebase'
import Button from '../components/ui/Button'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await sendPasswordResetEmail(auth, email)
      setShowConfirmation(true)
    } catch (err) {
      const code = err?.code || ''
      if (code.includes('user-not-found')) {
        setError('No account found with this email.')
      } else if (code.includes('invalid-email')) {
        setError('Invalid email address.')
      } else if (code.includes('too-many-requests')) {
        setError('Too many attempts. Please wait a moment.')
      } else {
        setError('Failed to send reset email. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleTryAnother = () => {
    setShowConfirmation(false)
    setEmail('')
    setError('')
  }

  return (
    <div className="bg-surface min-h-screen flex items-center justify-center p-md">
      <div className="w-full max-w-md">
        {/* Card Container */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm relative overflow-hidden transition-all duration-300">
          {/* Back Button */}
          <div className="mb-8">
            <button
              onClick={() => navigate('/login')}
              className="flex items-center text-primary font-label-md hover:text-primary-container transition-colors group"
            >
              <span className="material-symbols-outlined text-[20px] mr-1 group-hover:-translate-x-1 transition-transform">
                arrow_back
              </span>
              <span className="text-body-lg font-medium">Back</span>
            </button>
          </div>

          {/* Initial State - Request Reset */}
          {!showConfirmation && (
            <div className="flex flex-col opacity-100 transition-opacity duration-300">
              <h1 className="font-headline text-headline-lg md:text-display-md text-on-surface mb-4">
                Forgot Password
              </h1>
              <p className="text-body-lg text-on-surface-variant mb-8 leading-relaxed text-[18px]">
                Enter the email you signed up with. We'll send you a link to reset your password.
              </p>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-sm bg-error-container/20 rounded-lg flex items-start gap-xs border border-error/20">
                  <span className="material-symbols-outlined text-error text-[18px]">error</span>
                  <p className="font-body-sm text-on-error-container">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-body-lg font-semibold text-on-surface" htmlFor="email">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      className="w-full h-[56px] px-4 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface text-body-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline-variant"
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button
                  className="w-full h-[56px] bg-primary text-on-primary rounded-lg font-body-lg font-medium flex items-center justify-center gap-2 hover:bg-primary-container active:scale-[0.98] transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  type="submit"
                  disabled={loading}
                  style={{ background: 'linear-gradient(to bottom, #0F766E, #0D9488)' }}
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
            </div>
          )}

          {/* Confirmation State - Check Email */}
          {showConfirmation && (
            <div className="flex flex-col items-center text-center opacity-100 transition-opacity duration-300 py-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <span
                  className="material-symbols-outlined text-[32px] text-primary"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
              </div>
              <h2 className="font-headline text-headline-lg md:text-display-md text-on-surface mb-4">
                Check your email
              </h2>
              <p className="text-body-lg text-on-surface-variant mb-8 leading-relaxed text-[18px]">
                We've sent a password reset link to{' '}
                <span className="font-semibold text-on-surface">{email}</span>. If you don't see
                it, check your spam folder.
              </p>
              <button
                className="h-[56px] px-8 border border-outline-variant text-on-surface rounded-lg font-body-lg font-medium hover:bg-surface-container transition-colors"
                onClick={handleTryAnother}
              >
                Try another email
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
