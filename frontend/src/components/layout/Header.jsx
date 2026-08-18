import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export default function Header({ title = 'MedVision AI', showProfile = true }) {
  const navigate = useNavigate()
  const { user } = useAuth()

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-surface/80 backdrop-blur-xl shadow-header pt-safe">
      <div className="h-20 px-md flex items-center justify-between mx-auto max-w-container">
        <div className="flex items-center gap-sm">
          <img
            alt="MedVision AI logo"
            className="h-8 w-auto object-contain"
            src="https://lh3.googleusercontent.com/aida/AP1WRLtPhFC4UXGrBEfVYI_xJgb2ekO8uk4UTzjUSqbH-e7jh7iHcRp3oRC9NeY2aVIb9ANHyG-4TIfeLhGUOc-jPxuqZuEZrchuPLi9kKfmbLhmCLTg-1Yq1R7wqkxncx9_JdoiGXQPX8T4TcBubjkBuzg_lioaomAe5qopKu-8ePyeWu8vlYxsCnuc7MmeZI5ivEfwAr4YPDWimz_v4BtcvKqiLNWH7RoFnwOqQ5BpMKJ1KVVmqA3GH_OfqJo"
          />
          <span className="font-headline-md text-headline-md text-primary">{title}</span>
        </div>
        {showProfile && user && (
          <button
            onClick={() => navigate('/account-settings')}
            className="w-touch-target-min h-touch-target-min rounded-full bg-primary flex items-center justify-center cursor-pointer hover:bg-primary-container transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Go to profile"
          >
            <span className="material-symbols-outlined text-on-primary text-[24px]">person</span>
          </button>
        )}
      </div>
    </header>
  )
}
