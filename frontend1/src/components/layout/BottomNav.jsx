import { NavLink } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useAuthModal } from '../../App'

export default function BottomNav() {
  const { user } = useAuth()
  const { openAuthModal } = useAuthModal()

  const navItems = [
    { path: '/dashboard', icon: 'home', label: 'Home', requiresAuth: false },
    { path: '/chatbot', icon: 'chat_bubble', label: 'Chat', requiresAuth: false },
    { path: '/foot-scan-analysis', icon: 'photo_camera', label: 'Scan', requiresAuth: false },
    { path: '/history', icon: 'history', label: 'History', requiresAuth: false },
    { path: '/account-settings', icon: 'account_circle', label: 'Profile', requiresAuth: true },
  ]

  const handleNavClick = (e, item) => {
    if (item.requiresAuth && !user) {
      e.preventDefault()
      openAuthModal('login', item.path)
    }
  }

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-surface/95 backdrop-blur-md pb-safe border-t border-outline-variant/10 md:hidden">
      <div className="flex justify-around items-center h-14 max-w-container mx-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={(e) => handleNavClick(e, item)}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center min-w-[44px] h-full transition-colors gap-0.5 ${
                isActive ? 'text-primary' : 'text-on-surface-variant'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={`material-symbols-outlined text-[22px] ${isActive ? 'font-bold' : ''}`}>{item.icon}</span>
                <span className="font-label-sm text-[10px]">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
