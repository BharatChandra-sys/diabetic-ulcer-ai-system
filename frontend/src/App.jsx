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
    <div className="flex min-h-screen items-center justify-center bg-surface">
      <div className="flex flex-col items-center gap-md">
        <div className="flex items-center gap-sm">
          <img
            alt="MedVision AI logo"
            className="h-12 w-12 object-contain"
            src="https://lh3.googleusercontent.com/aida/AP1WRLtPhFC4UXGrBEfVYI_xJgb2ekO8uk4UTzjUSqbH-e7jh7iHcRp3oRC9NeY2aVIb9ANHyG-4TIfeLhGUOc-jPxuqZuEZrchuPLi9kKfmbLhmCLTg-1Yq1R7wqkxncx9_JdoiGXQPX8T4TcBubjkBuzg_lioaomAe5qopKu-8ePyeWu8vlYxsCnuc7MmeZI5ivEfwAr4YPDWimz_v4BtcvKqiLNWH7RoFnwOqQ5BpMKJ1KVVmqA3GH_OfqJo"
          />
          <span className="font-headline-lg text-headline-lg text-primary-container">MedVision AI</span>
        </div>
        <div className="h-1 w-48 rounded-full bg-surface-container overflow-hidden">
          <div className="h-full w-1/3 rounded-full bg-primary-container animate-[shimmer_1.5s_infinite]" />
        </div>
        <p className="font-body-md text-body-md text-on-surface-variant">Loading your workspace...</p>
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

      {/* Catch-all - redirect to login for non-authenticated, dashboard for authenticated */}
      <Route path="/"  element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="*"  element={<PublicRoute><Login /></PublicRoute>} />
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
