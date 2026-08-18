import { createContext, useContext, useState } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'

// Pages
import Dashboard from './pages/Dashboard'
import FootScanAnalysis from './pages/FootScanAnalysis'
import ScanResults from './pages/ScanResults'
import History from './pages/History'
import ChatbotWorkspace from './pages/ChatbotWorkspace'
import AccountSettings from './pages/AccountSettings'
import ResetPassword from './pages/ResetPassword'

// Components
import AuthModal from './components/auth/AuthModal'

// Auth Modal Context
const AuthModalContext = createContext({})

export function useAuthModal() {
  return useContext(AuthModalContext)
}

function AuthModalProvider({ children }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('login')
  const [redirectPath, setRedirectPath] = useState(null)

  const openAuthModal = (mode = 'login', redirect = null) => {
    setModalMode(mode)
    setRedirectPath(redirect)
    setIsModalOpen(true)
  }

  const closeAuthModal = () => {
    setIsModalOpen(false)
    setRedirectPath(null)
  }

  const value = {
    isModalOpen,
    modalMode,
    redirectPath,
    openAuthModal,
    closeAuthModal,
  }

  return (
    <AuthModalContext.Provider value={value}>
      {children}
      <AuthModal
        isOpen={isModalOpen}
        onClose={closeAuthModal}
        initialMode={modalMode}
        redirectAfterLogin={redirectPath}
      />
    </AuthModalContext.Provider>
  )
}

// Loading screen component
function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface">
      <div className="flex flex-col items-center gap-md">
        <span className="font-headline text-headline-lg text-primary">MedVision AI</span>
        <div className="h-1 w-48 rounded-full bg-surface-container overflow-hidden">
          <div className="h-full w-1/3 rounded-full bg-primary animate-pulse" />
        </div>
        <p className="font-body-md text-body-md text-on-surface-variant">Loading your workspace...</p>
      </div>
    </div>
  )
}

// Protected route wrapper - shows auth modal instead of redirecting
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const { openAuthModal } = useAuthModal()
  const location = useLocation()

  if (loading) return <LoadingScreen />
  
  if (!user) {
    // Open auth modal instead of redirecting
    setTimeout(() => openAuthModal('login', location.pathname), 0)
    return <Navigate to="/dashboard" replace />
  }
  
  return children
}

// App routes
function AppRoutes() {
  return (
    <Routes>
      {/* Public routes - accessible without login */}
      <Route path="/" element={<Dashboard />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/scan-results" element={<ScanResults />} />
      <Route path="/history" element={<History />} />
      <Route path="/chatbot" element={<ChatbotWorkspace />} />
      <Route path="/foot-scan-analysis" element={<FootScanAnalysis />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Protected routes - require authentication */}
      <Route path="/account-settings" element={<ProtectedRoute><AccountSettings /></ProtectedRoute>} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

// Root component
export default function App() {
  return (
    <AuthProvider>
      <AuthModalProvider>
        <AppRoutes />
      </AuthModalProvider>
    </AuthProvider>
  )
}
