import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { logout } from '../services/api'

export default function Dashboard({ onLogout }) {
  const navigate = useNavigate()
  const profileMenuRef = useRef(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [chatMessage, setChatMessage] = useState('')
  const [activeNav, setActiveNav] = useState('dashboard')
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  
  const patientProfile = JSON.parse(localStorage.getItem('patient_profile') || '{}')
  const userData = JSON.parse(localStorage.getItem('user_data') || '{}')
  const userName = patientProfile.full_name || userData.full_name || 'John Doe'
  const patientId = patientProfile.patient_id || userData.patient_id || userData.id || 'PT-2024-001'
  const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase()
  // Close profile menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      const profileContainer = document.querySelector('[data-profile-menu]')
      if (profileContainer && !profileContainer.contains(event.target)) {
        setShowProfileMenu(false)
      }
    }
    
    if (showProfileMenu) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [showProfileMenu])

  const handleLogout = () => {
    setShowProfileMenu(false)
    if (onLogout) {
      onLogout()
    }
    logout()
    navigate('/login', { replace: true })
  }

  const handleSearch = (e) => {
    e.preventDefault()
    console.log('Searching for:', searchQuery)
  }

  const handleChatSend = (e) => {
    e.preventDefault()
    if (chatMessage.trim()) {
      console.log('Sending message:', chatMessage)
      setChatMessage('')
    }
  }

  const handleNavigation = (path, navItem) => {
    setActiveNav(navItem)
  }

  return (
    <div className="flex min-h-screen bg-light text-slate-900 font-display">
      {/* Sidebar Navigation */}
      <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-slate-200 sticky top-0 h-screen">
        <button 
          onClick={() => handleNavigation('/dashboard', 'dashboard')} 
          className="p-6 flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <div className="size-10 bg-primary rounded-lg flex items-center justify-center text-white">
            <span className="material-symbols-outlined">health_metrics</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-primary">MedVision AI</h1>
        </button>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <button
            onClick={() => handleNavigation('#', 'dashboard')}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl font-bold transition-colors ${
              activeNav === 'dashboard'
                ? 'bg-primary/10 text-primary'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span className="material-symbols-outlined">dashboard</span>
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => handleNavigation('#', 'scan')}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-colors ${
              activeNav === 'scan'
                ? 'bg-primary/10 text-primary font-bold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span className="material-symbols-outlined">footprint</span>
            <span>Foot Scan Analysis</span>
          </button>
          <button
            onClick={() => handleNavigation('#', 'ai')}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-colors ${
              activeNav === 'ai'
                ? 'bg-primary/10 text-primary font-bold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span className="material-symbols-outlined">smart_toy</span>
            <span>AI Assistant</span>
          </button>
          <button
            onClick={() => handleNavigation('#', 'results')}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-colors ${
              activeNav === 'results'
                ? 'bg-primary/10 text-primary font-bold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span className="material-symbols-outlined">assignment</span>
            <span>Scan Results</span>
          </button>
          <button
            onClick={() => handleNavigation('#', 'progress')}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-colors ${
              activeNav === 'progress'
                ? 'bg-primary/10 text-primary font-bold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span className="material-symbols-outlined">trending_up</span>
            <span>Healing Progress</span>
          </button>
          <button
            onClick={() => handleNavigation('#', 'reports')}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-colors ${
              activeNav === 'reports'
                ? 'bg-primary/10 text-primary font-bold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span className="material-symbols-outlined">description</span>
            <span>Reports</span>
          </button>
        </nav>
        <div className="p-4 border-t border-slate-200">
          <button
            onClick={() => handleNavigation('#', 'settings')}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-colors ${
              activeNav === 'settings'
                ? 'bg-primary/10 text-primary font-bold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span className="material-symbols-outlined">settings</span>
            <span>Settings</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-light">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4 lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-600 hover:text-slate-900"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <span className="font-bold text-primary">MedScan AI</span>
          </div>
          <div className="flex-1 max-w-xl mx-8 hidden md:block">
            <form onSubmit={handleSearch} className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">search</span>
              <input
                className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-lg focus:ring-2 focus:ring-primary/50 text-sm text-slate-900 placeholder-slate-500"
                placeholder="Search records, scans or help..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </div>
          <div className="flex items-center gap-4">
            <button className="size-10 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-600 transition-colors">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <div className="h-8 w-px bg-slate-200"></div>
            <div className="relative flex items-center gap-3" ref={profileMenuRef} data-profile-menu>
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900">{userName}</p>
                <p className="text-xs text-slate-500">Patient ID: {patientId}</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowProfileMenu(!showProfileMenu)
                }}
                className="size-10 rounded-full border-2 border-primary/20 hover:border-primary/50 transition-colors overflow-hidden flex items-center justify-center bg-slate-200"
              >
                <img
                  alt="Profile"
                  className="size-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBRklI82cvGbeNsHns1kaONsyMCb5Qen7jb6ASvw326IpTc6Fsh8bwsITxol97CfOG93tfSbIgQqvsIWRmukG23kq-8OQHttVLpeQ_dsUGjp76a2cARalHkmW0ZLJCrm8NTOqSl8qxiLeZylraO4Kjt-0syy7EY86U2jQ1SbTU6fK1I0L_Ke0Q9rrRCi2d-TGkEk6UwUoSfj6Z83MmjpGTq66yFv2oJ8pbmDRAuA_v9uU6yp5tXSpOpvTFXmp_Cnkge0zHHgtdVVJ0"
                />
              </button>
              {showProfileMenu && (
                <div className="absolute top-full right-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-lg z-50 w-48" onClick={(e) => e.stopPropagation()}>
                  <button onClick={(e) => { e.stopPropagation(); setShowProfileMenu(false); navigate('/account-settings') }} className="w-full px-4 py-2 text-left text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-sm flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">person</span>
                    Profile Settings
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); setShowProfileMenu(false); navigate('/account-settings') }} className="w-full px-4 py-2 text-left text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-sm flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">settings</span>
                    Account
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); setShowProfileMenu(false); navigate('/history') }} className="w-full px-4 py-2 text-left text-slate-900 hover:bg-slate-100 transition-colors text-sm flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">history</span>
                    History
                  </button>
                  <div className="border-t border-slate-200"></div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleLogout()
                    }}
                    className="w-full px-4 py-2 text-left text-red-600 hover:bg-slate-100 transition-colors text-sm flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">logout</span>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6 space-y-6 pb-24 overflow-y-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome back, {userName.split(' ')[0]}</h2>
              <p className="text-slate-600">Here is your foot health overview for today.</p>
            </div>
            <button
              onClick={() => navigate('/foot-scan-analysis')}
              className="bg-gradient-to-r from-primary to-[#2575c0] text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 transition-all active:scale-95 w-full md:w-auto justify-center"
            >
              <span className="material-symbols-outlined text-[20px]">add_circle</span>
              Start New Scan
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer hover:shadow-sm">
              <p className="text-sm font-medium text-slate-600">Current Ulcer Risk</p>
              <div className="flex items-baseline justify-between mt-2">
                <p className="text-2xl font-bold text-green-600">Low</p>
                <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">-5% vs last month</span>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer hover:shadow-sm">
              <p className="text-sm font-medium text-slate-600">Healing Progress</p>
              <div className="flex items-baseline justify-between mt-2">
                <p className="text-2xl font-bold text-slate-900">84%</p>
                <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">+2% improvement</span>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer hover:shadow-sm">
              <p className="text-sm font-medium text-slate-600">Active Scans</p>
              <div className="flex items-baseline justify-between mt-2">
                <p className="text-2xl font-bold text-slate-900">12</p>
                <span className="text-xs font-bold text-slate-500 px-2 py-1">Total this month</span>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer hover:shadow-sm">
              <p className="text-sm font-medium text-slate-600">Next Review</p>
              <div className="flex items-baseline justify-between mt-2">
                <p className="text-xl font-bold text-slate-900">Oct 24, 2023</p>
                <span className="material-symbols-outlined text-primary">calendar_today</span>
              </div>
            </div>
          </div>

          {/* Main Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Charts and Scan Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Activity Chart */}
              <div className="bg-white p-6 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-slate-900">Foot Scans Per Week</h3>
                  <select className="bg-slate-100 border-none text-xs rounded-lg px-3 py-1 text-slate-700 focus:ring-1 focus:ring-primary cursor-pointer hover:bg-slate-200 transition-colors">
                    <option>Last 30 Days</option>
                    <option>Last 6 Months</option>
                  </select>
                </div>
                <div className="h-64 flex items-end justify-between gap-2">
                  <div className="w-full bg-blue-200 rounded-t-lg relative group h-[40%] hover:bg-blue-300 transition-colors cursor-pointer">
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">4 scans</div>
                  </div>
                  <div className="w-full bg-blue-200 rounded-t-lg relative group h-[60%] hover:bg-blue-300 transition-colors cursor-pointer"></div>
                  <div className="w-full bg-blue-200 rounded-t-lg relative group h-[35%] hover:bg-blue-300 transition-colors cursor-pointer"></div>
                  <div className="w-full bg-blue-200 rounded-t-lg relative group h-[85%] hover:bg-blue-300 transition-colors cursor-pointer"></div>
                  <div className="w-full bg-primary rounded-t-lg relative group h-[55%] hover:bg-primary/90 transition-colors cursor-pointer"></div>
                  <div className="w-full bg-blue-200 rounded-t-lg relative group h-[45%] hover:bg-blue-300 transition-colors cursor-pointer"></div>
                  <div className="w-full bg-primary rounded-t-lg relative group h-[95%] hover:bg-primary/90 transition-colors cursor-pointer"></div>
                </div>
                <div className="flex justify-between mt-4 text-[10px] text-slate-600 font-bold uppercase tracking-wider">
                  <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                </div>
              </div>

              {/* Recent Scan */}
              <div className="bg-white p-6 rounded-xl border border-slate-200">
                <h3 className="font-bold mb-4 text-slate-900">Recent Scan Analysis</h3>
                <div className="flex flex-col md:flex-row gap-6 items-center">
                  <div className="w-full md:w-1/3 aspect-square bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center relative hover:ring-2 hover:ring-primary/50 transition-all cursor-pointer">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>
                    <img
                      alt="Foot thermal scan"
                      className="w-full h-full object-cover mix-blend-multiply opacity-80"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuATCuRZGUSJkoMIAESPNV_6mevq-sUIYv8nJAogGVpuCr-krXgtmyL2qD6RatS3651W6cjBwySEpFuGBTkEELNZpcqt9y6i34D2qu8DGUwu-tNDb8r6ISEwgvRI_Ju-cXfbRG6V_Cco0pTIT1TFLO2sNfZPan4MYtNGw4JsNy93PtMxdu0qZdxGfN_PPrYb__lbC8lw9DdEZjRnAW6PNbSR8Ob0vuXJhFbL0disLW1x8d7sT5C1jxr2Fiz4RKMI9jaAKNK85zYthTA"
                    />
                    <div className="absolute top-2 right-2 bg-green-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">Normal</div>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-slate-100 rounded-lg border border-slate-200">
                        <p className="text-[10px] text-slate-600 uppercase font-bold tracking-widest">Temperature</p>
                        <p className="text-lg font-bold text-slate-900">36.5°C</p>
                      </div>
                      <div className="p-3 bg-slate-100 rounded-lg border border-slate-200">
                        <p className="text-[10px] text-slate-600 uppercase font-bold tracking-widest">Pressure Pt</p>
                        <p className="text-lg font-bold text-slate-900">Optimal</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-slate-900">AI Insights</p>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        The thermal profile shows no signs of inflammation. Pressure distribution is well-balanced. Continue current orthopedic support usage.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button className="text-xs font-bold text-primary border border-primary/30 px-3 py-1.5 rounded-lg hover:bg-primary/5 transition-colors">
                        View Full Report
                      </button>
                      <button className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition-colors">
                        Download DICOM
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Side Cards */}
            <div className="space-y-6">
              {/* Risk Distribution Donut */}
              <div className="bg-white p-6 rounded-xl border border-slate-200">
                <h3 className="font-bold mb-6 text-slate-900">Risk Distribution</h3>
                <div className="relative size-48 mx-auto flex items-center justify-center">
                  <svg className="size-full transform -rotate-90">
                    <circle className="text-slate-200" cx="96" cy="96" fill="transparent" r="80" stroke="currentColor" strokeWidth="20"></circle>
                    <circle className="text-primary" cx="96" cy="96" fill="transparent" r="80" stroke="currentColor" strokeDasharray="502.65" strokeDashoffset="100.53" strokeWidth="20"></circle>
                    <circle className="text-green-600" cx="96" cy="96" fill="transparent" r="80" stroke="currentColor" strokeDasharray="502.65" strokeDashoffset="400.12" strokeWidth="20"></circle>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-2xl font-bold text-slate-900">Low</p>
                    <p className="text-[10px] text-slate-600 font-bold uppercase">Profile</p>
                  </div>
                </div>
                <div className="mt-6 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="size-2 rounded-full bg-green-600"></div>
                      <span className="text-slate-700">Healthy Tissue</span>
                    </div>
                    <span className="font-bold text-slate-900">82%</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="size-2 rounded-full bg-primary"></div>
                      <span className="text-slate-700">Monitoring Zone</span>
                    </div>
                    <span className="font-bold text-slate-900">15%</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="size-2 rounded-full bg-red-600"></div>
                      <span className="text-slate-700">High Risk Area</span>
                    </div>
                    <span className="font-bold text-slate-900">3%</span>
                  </div>
                </div>
              </div>

              {/* My Foot Scans Collection */}
              <div onClick={() => navigate('/history')} className="bg-primary rounded-xl p-6 text-white overflow-hidden relative group hover:shadow-lg hover:shadow-primary/20 transition-all cursor-pointer">
                <div className="relative z-10">
                  <h3 className="text-lg font-bold mb-2">My Foot Scans</h3>
                  <p className="text-white/80 text-sm mb-6">View your complete history of 3D and thermal scans.</p>
                  <button onClick={(e) => { e.stopPropagation(); navigate('/history') }} className="inline-flex items-center gap-2 bg-white text-primary px-4 py-2 rounded-lg text-sm font-bold shadow-lg hover:bg-white/90 transition-colors">
                    Open Gallery
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>
                </div>
                <div className="absolute -bottom-10 -right-10 size-40 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500"></div>
                <div className="absolute top-0 right-0 p-4 opacity-20">
                  <span className="material-symbols-outlined text-6xl">footprint</span>
                </div>
              </div>

              {/* AI Assistant Mini */}
              <div className="bg-white p-6 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="size-8 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[20px]">chat_bubble</span>
                  </div>
                  <h3 className="font-bold text-slate-900">AI Assistant</h3>
                </div>
                <div className="bg-slate-100 p-3 rounded-lg mb-4 border border-slate-200">
                  <p className="text-xs text-slate-700">
                    "Your last scan shows significant improvement in blood flow. Would you like me to update your exercise plan?"
                  </p>
                </div>
                <form onSubmit={handleChatSend}>
                  <input
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-4 py-2 focus:ring-1 focus:ring-primary text-slate-900 placeholder-slate-500 transition-all"
                    placeholder="Ask medical AI..."
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                  />
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Bottom Navigation */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 flex items-center justify-between z-50">
          <button
            onClick={() => setActiveNav('dashboard')}
            className={`flex flex-col items-center gap-1 transition-colors ${
              activeNav === 'dashboard' ? 'text-primary' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[24px]">home</span>
            <span className="text-[10px] font-bold uppercase tracking-wider">Home</span>
          </button>
          <button
            onClick={() => setActiveNav('scan')}
            className={`flex flex-col items-center gap-1 transition-colors ${
              activeNav === 'scan' ? 'text-primary' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[24px]">footprint</span>
            <span className="text-[10px] font-bold uppercase tracking-wider">Scans</span>
          </button>
          <button
            onClick={() => setActiveNav('reports')}
            className={`flex flex-col items-center gap-1 transition-colors ${
              activeNav === 'reports' ? 'text-primary' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[24px]">bar_chart</span>
            <span className="text-[10px] font-bold uppercase tracking-wider">Reports</span>
          </button>
          <button
            onClick={() => setActiveNav('profile')}
            className={`flex flex-col items-center gap-1 transition-colors ${
              activeNav === 'profile' ? 'text-primary' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[24px]">person</span>
            <span className="text-[10px] font-bold uppercase tracking-wider">Profile</span>
          </button>
        </nav>

        {/* Global Footer */}
        <footer className="mt-auto p-6 border-t border-slate-200 bg-white pb-24 lg:pb-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-600">
            <div className="flex items-center gap-6">
              <p>© 2024 MedVision AI Platform. All rights reserved.</p>
              <button className="hover:text-slate-900 transition-colors">Privacy Policy</button>
              <button className="hover:text-slate-900 transition-colors">Terms of Service</button>
            </div>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <span className="size-2 bg-green-600 rounded-full"></span>
                System Operational
              </span>
              <div className="h-4 w-px bg-slate-200"></div>
              <span>HIPAA Compliant</span>
            </div>
          </div>
        </footer>
      </main>


    </div>
  )
}
