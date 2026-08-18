import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import axios from 'axios'

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  timeout: 15000,
})

const AuthContext = createContext({})

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  const saveSession = (data) => {
    localStorage.setItem('id_token',      data.id_token)
    localStorage.setItem('refresh_token', data.refresh_token || '')
    localStorage.setItem('user_info',     JSON.stringify({
      uid:         data.local_id,
      email:       data.email,
      displayName: data.display_name || data.email?.split('@')[0],
      photoURL:    data.photo_url || null,
    }))
  }

  const clearSession = () => {
    localStorage.removeItem('id_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user_info')
  }

  const buildUser = (raw) => ({
    uid:         raw.uid      || raw.local_id  || '',
    email:       raw.email    || '',
    displayName: raw.displayName || raw.display_name || raw.email?.split('@')[0] || 'User',
    photoURL:    raw.photoURL || raw.photo_url  || null,
  })

  // ── Silent token refresh ────────────────────────────────────────────────
  const refreshSession = useCallback(async () => {
    const refresh_token = localStorage.getItem('refresh_token')
    if (!refresh_token) return false
    try {
      const { data } = await API.post('/api/auth/refresh', { refresh_token })
      localStorage.setItem('id_token',      data.id_token)
      localStorage.setItem('refresh_token', data.refresh_token)
      return true
    } catch {
      clearSession()
      setUser(null)
      return false
    }
  }, [])

  // ── Restore session on mount ────────────────────────────────────────────
  useEffect(() => {
    const stored = localStorage.getItem('user_info')
    if (stored) {
      try {
        setUser(buildUser(JSON.parse(stored)))
      } catch {
        clearSession()
      }
    }
    setLoading(false)
  }, [])

  // ── Sign In ─────────────────────────────────────────────────────────────
  const signIn = async (email, password) => {
    const { data } = await API.post('/api/auth/signin', { email, password })
    saveSession(data)
    const u = buildUser({ uid: data.local_id, email: data.email, displayName: data.display_name })
    setUser(u)
    return u
  }

  // ── Sign Up ─────────────────────────────────────────────────────────────
  const signUp = async (email, password, displayName) => {
    const { data } = await API.post('/api/auth/signup', { email, password, displayName })
    saveSession(data)
    const u = buildUser({ uid: data.local_id, email: data.email, displayName: data.display_name || displayName })
    setUser(u)
    return u
  }

  // ── Google Sign-In ──────────────────────────────────────────────────────
  const signInWithGoogle = async (googleIdToken) => {
    const { data } = await API.post('/api/auth/google-signin', { id_token: googleIdToken })
    saveSession(data)
    const u = buildUser({ uid: data.local_id, email: data.email, displayName: data.display_name, photoURL: data.photo_url })
    setUser(u)
    return u
  }

  // ── Forgot Password (send OTP) ──────────────────────────────────────────
  const forgotPassword = async (email) => {
    await API.post('/api/auth/forgot-password', { email })
  }
  const signOut = async () => {
    clearSession()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, forgotPassword, signInWithGoogle, refreshSession }}>
      {children}
    </AuthContext.Provider>
  )
}
