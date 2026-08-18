import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useAuthModal } from '../../App'

export default function Header({ title = 'MedVision AI', showProfile = true, showBack = false, onBackClick }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { openAuthModal } = useAuthModal()

  const handleBack = () => {
    if (onBackClick) {
      onBackClick()
    } else {
      navigate(-1)
    }
  }

  const handleSignInClick = () => {
    openAuthModal('login')
  }

  return (
    <header className="fixed top-0 inset-x-0 md:left-64 z-50 bg-surface/95 backdrop-blur-md border-b border-outline-variant/10 pt-safe">
      <div className="h-14 px-md flex items-center justify-between mx-auto max-w-screen-xl">
        <div className="flex items-center gap-sm">
          {showBack && (
            <button
              onClick={handleBack}
              className="flex items-center justify-center h-9 px-2 text-primary hover:bg-surface-container rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="Go back"
            >
              <span className="material-symbols-outlined text-[20px] mr-1">arrow_back</span>
              <span className="font-label-sm text-[14px]">Back</span>
            </button>
          )}
          {!showBack && (
            <span className="font-headline text-[17px] font-semibold text-on-surface tracking-tight md:text-[19px]">
              MedVision AI
            </span>
          )}
        </div>
        
        {showProfile && (
          user ? (
            <button
              onClick={() => navigate('/account-settings')}
              className="md:hidden w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center cursor-pointer hover:bg-primary/20 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Go to profile"
            >
              <span className="material-symbols-outlined text-primary text-[20px]">person</span>
            </button>
          ) : (
            <button
              onClick={handleSignInClick}
              className="h-9 px-4 rounded-full bg-primary text-on-primary font-label-sm text-[13px] hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary md:hidden"
            >
              Sign In
            </button>
          )
        )}
      </div>
    </header>
  )
}
