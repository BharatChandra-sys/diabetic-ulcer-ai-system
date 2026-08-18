import { NavLink } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useAuthModal } from '../../App'

export default function DesktopSidebar() {
  const { user } = useAuth()
  const { openAuthModal } = useAuthModal()

  const navItems = [
    { path: '/dashboard', icon: 'home', label: 'Home', requiresAuth: false },
    { path: '/chatbot', icon: 'chat_bubble', label: 'Chat', requiresAuth: false },
    { path: '/foot-scan-analysis', icon: 'photo_camera', label: 'New Scan', requiresAuth: false },
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
    <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-56 bg-surface/95 backdrop-blur-md border-r border-outline-variant/10 z-40 flex-col">
      <div className="h-14 px-4 flex items-center border-b border-outline-variant/10">
        <span className="font-headline text-[17px] font-semibold text-on-surface tracking-tight">
          MedVision AI
        </span>
      </div>
      
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={(e) => handleNavClick(e, item)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-[14px] ${
                isActive
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-on-surface-variant hover:bg-surface-container'
              }`
            }
          >
            <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
            <span className="font-label-md">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-outline-variant/10">
        {user ? (
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-primary text-[18px]">person</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-label-sm text-[13px] text-on-surface truncate">
                {user.displayName || user.email}
              </p>
              <p className="font-body-xs text-[11px] text-on-surface-variant truncate">
                {user.email}
              </p>
            </div>
          </div>
        ) : (
          <button
            onClick={() => openAuthModal('login')}
            className="w-full px-3 py-2 rounded-lg bg-primary text-on-primary font-label-sm text-[13px] hover:bg-primary/90 transition-colors"
          >
            Sign In
          </button>
        )}
      </div>
    </aside>
  )
}
