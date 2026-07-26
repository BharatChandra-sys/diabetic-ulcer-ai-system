// Firebase configuration and auth instance
// Add your Firebase project config to frontend/.env:
//   VITE_FIREBASE_API_KEY=...
//   VITE_FIREBASE_AUTH_DOMAIN=...
//   VITE_FIREBASE_PROJECT_ID=...
//   VITE_FIREBASE_APP_ID=...

import { initializeApp } from 'firebase/app'
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  confirmPasswordReset,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth'

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
}

const app  = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()

// ── Auth helpers ─────────────────────────────────────────────────────────────

/** Register with email + password, optionally set display name */
export async function firebaseRegister(email, password, displayName) {
  const cred = await createUserWithEmailAndPassword(auth, email, password)
  if (displayName) {
    await updateProfile(cred.user, { displayName })
  }
  return cred.user
}

/** Sign in with email + password */
export async function firebaseLogin(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password)
  return cred.user
}

/** Sign in with Google popup */
export async function firebaseGoogleLogin() {
  const cred = await signInWithPopup(auth, googleProvider)
  return cred.user
}

/** Send Firebase password-reset email */
export async function firebaseForgotPassword(email) {
  await sendPasswordResetEmail(auth, email)
}

/** Confirm a password reset with oobCode from the email link */
export async function firebaseConfirmPasswordReset(oobCode, newPassword) {
  await confirmPasswordReset(auth, oobCode, newPassword)
}

/** Sign out */
export async function firebaseLogout() {
  await signOut(auth)
}

/** Get fresh Firebase ID token to send to backend as Bearer */
export async function getIdToken() {
  const user = auth.currentUser
  if (!user) return null
  return user.getIdToken()   // auto-refreshes when near expiry
}

/** Subscribe to auth state changes */
export { onAuthStateChanged }
