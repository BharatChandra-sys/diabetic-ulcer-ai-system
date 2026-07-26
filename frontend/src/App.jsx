import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'

import Login               from './pages/Login'
import Signup              from './pages/Signup'
import ForgotPassword      from './pages/ForgotPassword'
import ResetPassword       from './pages/ResetPassword'
import Dashboard           from './pages/Dashboard'
import FootScanAnalysis    from './pages/FootScanAnalysis'
import ScanResults         from './pages/ScanResults'
import HealthMetricsResults from './pages/HealthMetricsResults'
import AccountSettings     from './pages/AccountSettings'
import ChatbotWorkspace    from './pages/ChatbotWorkspace'
import History             from './pages/History'
import { logout }          from './services/api'

// ── Full-screen loading spinner ───────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8fafc]">
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#308ce8] flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-xl">health_metrics</span>
          </div>
          <span className="text-xl font-bold text-slate-900">MedVision AI</span>
        </div>
        <div className="h-1 w-48 rounded-full bg-slate-200 overflow-hidden">
          <div className="h-full w-1/3 rounded-full bg-[#308ce8] animate-[shimmer_1.5s_infinite]" />
        </div>
        <p className="text-sm text-slate-500">Loading your workspace...</p>
      </div>
    </div>
  )
}

// ── Protected route — redirects to /login if not authenticated ────────────────
// Shows loading skeleton while Firebase resolves auth state
// Authenticated users hit the page directly — no flash to login
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <LoadingScreen />
  if (!user)   return <Navigate to="/login" state={{ from: location }} replace />
  return children
}

// ── Public route — redirects to /dashboard if already logged in ───────────────
// Shows loading during auth check so logged-in users never see the login flash
function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (user)    return <Navigate to="/dashboard" replace />
  return children
}

// ── Inner app (has access to useAuth) ────────────────────────────────────────
function AppRoutes() {
  return (
    <Routes>
      {/* Public — redirect to dashboard if already signed in */}
      <Route path="/login"          element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/signup"         element={<PublicRoute><Signup /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />

      {/* Firebase sends password-reset emails with ?oobCode=... and mode=resetPassword.
          The link goes to your authDomain/__/auth/action which then redirects to
          your app at /reset-password?oobCode=...  (configure in Firebase console:
          Authentication → Templates → Edit → Action URL = https://your-app.com/reset-password) */}
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Protected — require Firebase auth */}
      <Route path="/dashboard"              element={<ProtectedRoute><Dashboard onLogout={logout} /></ProtectedRoute>} />
      <Route path="/foot-scan-analysis"     element={<ProtectedRoute><FootScanAnalysis onLogout={logout} /></ProtectedRoute>} />
      <Route path="/scan-results"           element={<ProtectedRoute><ScanResults onLogout={logout} /></ProtectedRoute>} />
      <Route path="/health-metrics-results" element={<ProtectedRoute><HealthMetricsResults onLogout={logout} /></ProtectedRoute>} />
      <Route path="/account-settings"       element={<ProtectedRoute><AccountSettings onLogout={logout} /></ProtectedRoute>} />
      <Route path="/chatbot"                element={<ProtectedRoute><ChatbotWorkspace onLogout={logout} /></ProtectedRoute>} />
      <Route path="/history"                element={<ProtectedRoute><History onLogout={logout} /></ProtectedRoute>} />

      {/* Catch-all */}
      <Route path="/"  element={<Navigate to="/dashboard" replace />} />
      <Route path="*"  element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

// ── Root export — wraps everything in AuthProvider ────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
