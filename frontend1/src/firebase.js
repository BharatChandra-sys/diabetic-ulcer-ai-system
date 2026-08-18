/**
 * Firebase is now handled entirely by the backend.
 * This file is kept as a shim so nothing breaks during migration.
 * All auth calls go through /api/auth/* backend endpoints.
 */

export async function getIdToken() {
  // Token is stored in localStorage after backend login
  return localStorage.getItem('id_token') || null
}

export async function firebaseLogout() {
  localStorage.removeItem('id_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('user_info')
}
