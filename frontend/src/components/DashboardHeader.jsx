import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function DashboardHeader({ title = 'MedVision AI', showBackButton = false, backTo = null, onLogout }) {
  const navigate  = useNavigate()
  const { user, logout: fbLogout } = useAuth()
  const [showMenu, setShowMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  // Prefer Firebase user data, fallback to localStorage
  const storedProfile = JSON.parse(localStorage.getItem('patient_profile') || '{}')
  const displayName = user?.displayName || storedProfile.full_name || 'User'
  const photoURL    = user?.photoURL || null
  const initials    = displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  const handleLogout = async () => {
    setShowMenu(false)
    if (onLogout) onLogout()
    await fbLogout()
    navigate('/login', { replace: true })
  }

  const navItems = [
    { icon: 'dashboard',    label: 'Dashboard',    path: '/dashboard' },
    { icon: 'camera',       label: 'New Scan',     path: '/foot-scan-analysis' },
    { icon: 'smart_toy',    label: 'AI Chat',      path: '/chatbot' },
    { icon: 'history',      label: 'History',      path: '/history' },
    { icon: 'manage_accounts', label: 'Settings',  path: '/account-settings' },
  ]

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-sm shadow-sm">
        <div className="flex h-16 items-center gap-3 px-4 lg:px-8">

          {/* Back button */}
          {showBackButton && backTo && (
            <button
              onClick={() => navigate(backTo)}
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg hover:bg-slate-100 transition-colors text-slate-600"
            >
              <span className="material-symbols-outlined text-xl">arrow_back</span>
            </button>
          )}

          {/* Logo / Title */}
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity flex-shrink-0"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#308ce8] text-white shadow-md shadow-[#308ce8]/30">
              <span className="material-symbols-outlined text-lg">health_metrics</span>
            </div>
            <span className="hidden sm:block text-lg font-extrabold tracking-tight text-slate-900">
              {title}
            </span>
          </button>

          {/* Desktop nav links */}
          <nav className="hidden xl:flex items-center gap-1 ml-6">
            {navItems.slice(0, 4).map(item => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Action icons */}
          <div className="flex items-center gap-1">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setShowMobileMenu(v => !v)}
              className="flex xl:hidden h-9 w-9 items-center justify-center rounded-lg hover:bg-slate-100 transition-colors text-slate-600"
            >
              <span className="material-symbols-outlined text-xl">menu</span>
            </button>

            {/* Notifications */}
            <button className="hidden sm:flex h-9 w-9 items-center justify-center rounded-lg hover:bg-slate-100 transition-colors text-slate-600 relative">
              <span className="material-symbols-outlined text-xl">notifications</span>
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 border border-white" />
            </button>

            {/* New scan shortcut */}
            <button
              onClick={() => navigate('/foot-scan-analysis')}
              className="hidden md:flex items-center gap-1.5 rounded-xl bg-[#308ce8] px-4 py-2 text-sm font-bold text-white shadow-md shadow-[#308ce8]/25 transition-all hover:-translate-y-px hover:shadow-[#308ce8]/40 active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              New Scan
            </button>

            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(v => !v)}
                className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-slate-100 transition-colors"
              >
                {photoURL ? (
                  <img src={photoURL} alt={displayName} className="h-8 w-8 rounded-full object-cover ring-2 ring-[#308ce8]/20" />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-[#308ce8]/10 text-[#308ce8] flex items-center justify-center text-xs font-bold ring-2 ring-[#308ce8]/20">
                    {initials}
                  </div>
                )}
                <span className="hidden md:block text-sm font-semibold text-slate-900 max-w-[120px] truncate">
                  {displayName.split(' ')[0]}
                </span>
                <span className="material-symbols-outlined text-sm text-slate-500">expand_more</span>
              </button>

              {/* Dropdown */}
              {showMenu && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-slate-200 bg-white shadow-xl z-50 overflow-hidden">
                  {/* User info */}
                  <div className="px-4 py-3 bg-gradient-to-r from-[#308ce8]/8 to-blue-50 border-b border-slate-100">
                    <p className="text-sm font-bold text-slate-900 truncate">{displayName}</p>
                    <p className="text-xs text-slate-500 truncate mt-0.5">{user?.email || ''}</p>
                  </div>
                  {/* Links */}
                  <div className="p-2">
                    {[
                      { icon: 'person',    label: 'Profile Settings', path: '/account-settings' },
                      { icon: 'dashboard', label: 'Dashboard',        path: '/dashboard' },
                      { icon: 'history',   label: 'Scan History',     path: '/history' },
                    ].map(item => (
                      <button
                        key={item.path}
                        onClick={() => { navigate(item.path); setShowMenu(false) }}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        <span className="material-symbols-outlined text-lg text-slate-500">{item.icon}</span>
                        {item.label}
                      </button>
                    ))}
                    <div className="my-1 h-px bg-slate-100" />
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <span className="material-symbols-outlined text-lg">logout</span>
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile nav drawer */}
        {showMobileMenu && (
          <div className="xl:hidden border-t border-slate-100 bg-white px-4 py-3">
            <div className="grid grid-cols-4 gap-2">
              {navItems.map(item => (
                <button
                  key={item.path}
                  onClick={() => { navigate(item.path); setShowMobileMenu(false) }}
                  className="flex flex-col items-center gap-1 rounded-xl py-2 px-1 text-slate-600 hover:bg-slate-100 hover:text-[#308ce8] transition-colors"
                >
                  <span className="material-symbols-outlined text-xl">{item.icon}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wide">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Click-outside overlay */}
      {(showMenu || showMobileMenu) && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => { setShowMenu(false); setShowMobileMenu(false) }}
        />
      )}
    </>
  )
}
