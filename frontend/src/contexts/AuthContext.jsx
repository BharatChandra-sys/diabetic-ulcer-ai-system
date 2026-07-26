import { createContext, useContext, useEffect, useState } from 'react'
import { auth, onAuthStateChanged, firebaseLogout } from '../firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(undefined)  // undefined = loading
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)
      if (firebaseUser) {
        // Keep lightweight user data available synchronously
        localStorage.setItem('user_data', JSON.stringify({
          email:        firebaseUser.email,
          full_name:    firebaseUser.displayName || '',
          uid:          firebaseUser.uid,
          photo_url:    firebaseUser.photoURL || '',
        }))
      } else {
        localStorage.removeItem('user_data')
      }
    })
    return unsub
  }, [])

  const logout = async () => {
    await firebaseLogout()
    localStorage.removeItem('user_data')
    localStorage.removeItem('patient_profile')
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
