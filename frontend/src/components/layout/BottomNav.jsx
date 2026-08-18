import { NavLink } from 'react-router-dom'

export default function BottomNav() {
  const navItems = [
    { path: '/dashboard', icon: 'home', label: 'Home' },
    { path: '/foot-scan-analysis', icon: 'qr_code_scanner', label: 'Scan' },
    { path: '/history', icon: 'history', label: 'History' },
    { path: '/chatbot', icon: 'chat_bubble', label: 'Chat' },
    { path: '/account-settings', icon: 'account_circle', label: 'Profile' },
  ]

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-surface/80 backdrop-blur-xl pb-safe shadow-bottom-nav">
      <div className="flex justify-around items-center h-20 max-w-container mx-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center min-w-[48px] h-full transition-colors ${
                isActive ? 'text-primary font-bold' : 'text-on-surface-variant'
              }`
            }
          >
            <span className="material-symbols-outlined text-[28px]">{item.icon}</span>
            <span className="font-label-md text-label-md text-[11px]">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
