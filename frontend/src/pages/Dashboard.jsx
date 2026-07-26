import { useRef, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { logout } from '../services/api'

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, badge, badgeColor = 'green', iconBg = 'bg-blue-50 text-[#308ce8]' }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-[#308ce8]/20 transition-all cursor-pointer">
      <div className="flex items-start justify-between mb-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg}`}>
          <span className="material-symbols-outlined text-xl">{icon}</span>
        </div>
        {badge && (
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
            badgeColor === 'green' ? 'bg-green-100 text-green-700' :
            badgeColor === 'red'   ? 'bg-red-100 text-red-700' :
            badgeColor === 'blue'  ? 'bg-blue-100 text-blue-700' :
            'bg-slate-100 text-slate-600'
          }`}>{badge}</span>
        )}
      </div>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-extrabold text-slate-900">{value}</p>
    </div>
  )
}

// ── Quick action button ───────────────────────────────────────────────────────
function QuickAction({ icon, label, sub, color, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col gap-2 rounded-2xl p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-95 ${color}`}
    >
      <span className="material-symbols-outlined text-2xl">{icon}</span>
      <div>
        <p className="font-bold text-sm">{label}</p>
        <p className="text-xs opacity-80 mt-0.5">{sub}</p>
      </div>
    </button>
  )
}

export default function Dashboard({ onLogout }) {
  const navigate    = useNavigate()
  const { user, logout: fbLogout } = useAuth()
  const [showMenu, setShowMenu] = useState(false)
  const menuRef     = useRef(null)

  // User info — prefer Firebase, fallback localStorage
  const stored   = JSON.parse(localStorage.getItem('patient_profile') || '{}')
  const userData = JSON.parse(localStorage.getItem('user_data') || '{}')
  const displayName = user?.displayName || stored.full_name || userData.full_name || 'there'
  const firstName   = displayName.split(' ')[0]
  const photoURL    = user?.photoURL || null
  const initials    = displayName.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()

  const handleLogout = async () => {
    setShowMenu(false)
    if (onLogout) onLogout()
    logout()
    await fbLogout()
    navigate('/login', { replace: true })
  }

  useEffect(() => {
    function outside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false)
    }
    if (showMenu) document.addEventListener('mousedown', outside)
    return () => document.removeEventListener('mousedown', outside)
  }, [showMenu])

  return (
    <div className="min-h-screen bg-[#f8fafc] font-display">

      {/* ── Top nav ── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 lg:px-8">
          {/* Logo */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#308ce8] text-white shadow-md shadow-[#308ce8]/30">
              <span className="material-symbols-outlined text-lg">health_metrics</span>
            </div>
            <span className="hidden sm:block text-lg font-extrabold tracking-tight text-slate-900">MedVision AI</span>
          </div>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1 ml-6">
            {[
              { icon: 'dashboard',   label: 'Dashboard',  path: '/dashboard', active: true },
              { icon: 'camera',      label: 'Scan',       path: '/foot-scan-analysis' },
              { icon: 'smart_toy',   label: 'AI Chat',    path: '/chatbot' },
              { icon: 'history',     label: 'History',    path: '/history' },
            ].map(n => (
              <button
                key={n.path}
                onClick={() => navigate(n.path)}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
                  n.active ? 'bg-[#308ce8]/10 text-[#308ce8]' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{n.icon}</span>
                {n.label}
              </button>
            ))}
          </nav>

          <div className="flex-1" />

          {/* New scan CTA */}
          <button
            onClick={() => navigate('/foot-scan-analysis')}
            className="hidden md:flex items-center gap-1.5 rounded-xl bg-[#308ce8] px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-[#308ce8]/25 transition-all hover:-translate-y-px hover:shadow-[#308ce8]/40 active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            New Scan
          </button>

          {/* Profile */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(v => !v)}
              className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-slate-100 transition-colors"
            >
              {photoURL
                ? <img src={photoURL} alt={displayName} className="h-8 w-8 rounded-full object-cover ring-2 ring-[#308ce8]/20" />
                : <div className="h-8 w-8 rounded-full bg-[#308ce8]/10 text-[#308ce8] flex items-center justify-center text-xs font-bold ring-2 ring-[#308ce8]/20">{initials}</div>
              }
              <span className="hidden md:block text-sm font-semibold text-slate-900 max-w-[100px] truncate">{firstName}</span>
              <span className="material-symbols-outlined text-sm text-slate-500">expand_more</span>
            </button>
            {showMenu && (
              <div className="absolute right-0 top-full mt-2 w-52 rounded-2xl border border-slate-200 bg-white shadow-xl z-50 overflow-hidden">
                <div className="px-4 py-3 bg-gradient-to-r from-[#308ce8]/8 to-blue-50 border-b border-slate-100">
                  <p className="text-sm font-bold text-slate-900 truncate">{displayName}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.email || ''}</p>
                </div>
                <div className="p-2">
                  {[
                    { icon: 'person',    label: 'Settings',    path: '/account-settings' },
                    { icon: 'history',   label: 'History',     path: '/history' },
                    { icon: 'camera',    label: 'New Scan',    path: '/foot-scan-analysis' },
                  ].map(i => (
                    <button key={i.path} onClick={() => { navigate(i.path); setShowMenu(false) }}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-100 transition-colors">
                      <span className="material-symbols-outlined text-lg text-slate-500">{i.icon}</span>
                      {i.label}
                    </button>
                  ))}
                  <div className="my-1 h-px bg-slate-100" />
                  <button onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                    <span className="material-symbols-outlined text-lg">logout</span>
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="mx-auto max-w-7xl px-4 lg:px-8 py-6 pb-28 lg:pb-10 space-y-8">

        {/* Welcome hero */}
        <div className="rounded-2xl bg-gradient-to-r from-[#308ce8] to-[#2575c0] p-6 lg:p-8 text-white shadow-xl shadow-[#308ce8]/20 overflow-hidden relative">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-10 -right-10 h-48 w-48 rounded-full bg-white blur-3xl" />
            <div className="absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-white blur-3xl" />
          </div>
          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <p className="text-white/80 text-sm font-medium">Good day,</p>
              <h1 className="text-2xl lg:text-3xl font-extrabold mt-1">{firstName} 👋</h1>
              <p className="text-white/75 text-sm mt-2 max-w-md">
                Your foot health platform is ready. Upload a scan to get an instant AI-powered risk assessment.
              </p>
            </div>
            <button
              onClick={() => navigate('/foot-scan-analysis')}
              className="flex items-center gap-2 rounded-2xl bg-white/20 hover:bg-white/30 border border-white/30 backdrop-blur-sm px-6 py-3.5 font-bold text-white transition-all hover:-translate-y-px active:scale-95 flex-shrink-0"
            >
              <span className="material-symbols-outlined text-xl">camera_alt</span>
              Start New Scan
            </button>
          </div>
        </div>

        {/* Stats grid — 2 cols mobile, 4 desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon="shield_check" label="Ulcer Risk" value="Low" badge="-5%" badgeColor="green" iconBg="bg-green-50 text-green-600" />
          <StatCard icon="trending_up" label="Healing Progress" value="84%" badge="+2%" badgeColor="blue" iconBg="bg-blue-50 text-[#308ce8]" />
          <StatCard icon="camera" label="Scans This Month" value="12" iconBg="bg-purple-50 text-purple-600" />
          <StatCard icon="calendar_today" label="Next Review" value="Oct 24" badge="Upcoming" badgeColor="slate" iconBg="bg-orange-50 text-orange-600" />
        </div>

        {/* Quick actions — 2 cols mobile, 4 desktop */}
        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <QuickAction
              icon="camera_alt" label="New Scan" sub="Upload foot image"
              color="bg-[#308ce8] text-white shadow-lg shadow-[#308ce8]/25"
              onClick={() => navigate('/foot-scan-analysis')}
            />
            <QuickAction
              icon="smart_toy" label="AI Chat" sub="Ask questions"
              color="bg-purple-600 text-white shadow-lg shadow-purple-600/25"
              onClick={() => navigate('/chatbot')}
            />
            <QuickAction
              icon="history" label="History" sub="Past analyses"
              color="bg-slate-800 text-white shadow-lg shadow-slate-800/25"
              onClick={() => navigate('/history')}
            />
            <QuickAction
              icon="manage_accounts" label="Settings" sub="Your profile"
              color="bg-emerald-600 text-white shadow-lg shadow-emerald-600/25"
              onClick={() => navigate('/account-settings')}
            />
          </div>
        </section>

        {/* Two-column content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left: Chart + Recent Scan ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Scan frequency chart */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-bold text-slate-900">Scans This Week</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Daily scan frequency</p>
                </div>
                <select className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-[#308ce8]/20 outline-none">
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                </select>
              </div>
              {/* Bar chart */}
              <div className="flex items-end gap-2 h-36">
                {[40, 60, 35, 85, 55, 45, 95].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className={`w-full rounded-t-lg transition-all hover:opacity-80 cursor-pointer ${
                        i === 6 ? 'bg-[#308ce8]' : 'bg-[#308ce8]/25'
                      }`}
                      style={{ height: `${h}%` }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => (
                  <span key={d} className="flex-1 text-center">{d}</span>
                ))}
              </div>
            </div>

            {/* Recent scan card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900">Most Recent Scan</h3>
                <button onClick={() => navigate('/history')} className="text-xs font-bold text-[#308ce8] hover:underline flex items-center gap-1">
                  View all <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
              <div className="flex gap-4">
                <div className="relative h-24 w-24 flex-shrink-0 rounded-xl overflow-hidden bg-slate-100">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#308ce8]/10 to-transparent" />
                  <div className="flex h-full items-center justify-center">
                    <span className="material-symbols-outlined text-3xl text-slate-300">image</span>
                  </div>
                  <span className="absolute bottom-1 right-1 rounded-md bg-green-500 px-1.5 py-0.5 text-[10px] font-bold text-white">Normal</span>
                </div>
                <div className="flex-1 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-lg bg-slate-50 p-2 border border-slate-100">
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wide">Temperature</p>
                      <p className="text-sm font-bold text-slate-900 mt-0.5">36.5°C</p>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-2 border border-slate-100">
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wide">Pressure</p>
                      <p className="text-sm font-bold text-slate-900 mt-0.5">Optimal</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    No inflammation detected. Continue current orthopaedic support protocol.
                  </p>
                  <button
                    onClick={() => navigate('/scan-results')}
                    className="text-xs font-bold text-[#308ce8] border border-[#308ce8]/30 px-3 py-1.5 rounded-lg hover:bg-[#308ce8]/5 transition-colors"
                  >
                    View Full Report
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right: Risk donut + AI mini chat ── */}
          <div className="space-y-6">

            {/* Risk donut */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4">Risk Distribution</h3>
              <div className="relative h-36 w-36 mx-auto">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="48" fill="none" stroke="#e2e8f0" strokeWidth="14" />
                  <circle cx="60" cy="60" r="48" fill="none" stroke="#22c55e" strokeWidth="14"
                    strokeDasharray={`${0.82 * 301.6} ${301.6}`} strokeLinecap="round" />
                  <circle cx="60" cy="60" r="48" fill="none" stroke="#308ce8" strokeWidth="14"
                    strokeDasharray={`${0.15 * 301.6} ${301.6}`} strokeDashoffset={`-${0.82 * 301.6}`} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-extrabold text-slate-900">Low</span>
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Profile</span>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {[
                  { color: 'bg-green-500',  label: 'Healthy',   val: '82%' },
                  { color: 'bg-[#308ce8]',  label: 'Monitoring', val: '15%' },
                  { color: 'bg-red-500',    label: 'High Risk',  val: '3%' },
                ].map(r => (
                  <div key={r.label} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${r.color}`} />
                      <span className="text-slate-600">{r.label}</span>
                    </div>
                    <span className="font-bold text-slate-900">{r.val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI mini chat */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#308ce8]/10">
                  <span className="material-symbols-outlined text-[#308ce8] text-[18px]">smart_toy</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">AI Assistant</p>
                  <span className="flex items-center gap-1 text-[10px] text-green-600 font-semibold">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" />Online
                  </span>
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 mb-3">
                <p className="text-xs text-slate-700 leading-relaxed">
                  "Your last scan shows significant improvement in blood flow. Would you like me to update your exercise plan?"
                </p>
              </div>
              <button
                onClick={() => navigate('/chatbot')}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#308ce8]/10 text-[#308ce8] py-2.5 text-sm font-bold hover:bg-[#308ce8]/15 transition-colors"
              >
                <span className="material-symbols-outlined text-lg">chat</span>
                Open AI Chat
              </button>
            </div>

            {/* Scan gallery shortcut */}
            <button
              onClick={() => navigate('/history')}
              className="w-full rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-5 text-left overflow-hidden relative group hover:shadow-xl transition-all hover:-translate-y-0.5"
            >
              <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-white/5 blur-2xl group-hover:scale-150 transition-transform duration-500" />
              <span className="material-symbols-outlined text-4xl text-white/20 absolute top-4 right-4">footprint</span>
              <div className="relative">
                <p className="text-white font-bold text-sm">My Scan Gallery</p>
                <p className="text-white/60 text-xs mt-1 mb-4">View all 3D and thermal scan history</p>
                <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/15 px-4 py-2 text-xs font-bold text-white">
                  Open Gallery <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </span>
              </div>
            </button>
          </div>
        </div>
      </main>

      {/* ── Mobile bottom nav ── */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 border-t border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className="flex items-center justify-around px-2 py-2 pb-safe">
          {[
            { icon: 'home',      label: 'Home',     path: '/dashboard', active: true },
            { icon: 'camera',    label: 'Scan',     path: '/foot-scan-analysis' },
            { icon: 'smart_toy', label: 'AI',       path: '/chatbot' },
            { icon: 'history',   label: 'History',  path: '/history' },
            { icon: 'person',    label: 'Profile',  path: '/account-settings' },
          ].map(n => (
            <button
              key={n.path}
              onClick={() => navigate(n.path)}
              className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-colors ${
                n.active ? 'text-[#308ce8]' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: n.active ? "'FILL' 1" : "'FILL' 0" }}>{n.icon}</span>
              <span className="text-[10px] font-bold">{n.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
