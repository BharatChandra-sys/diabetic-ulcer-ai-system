import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  timeout: 60000,
})

// ── Attach stored ID token to every request ──────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('id_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ── On 401, try silent refresh then retry once ───────────────────────────────
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config

    if (error.response?.status === 401 && !original._retried) {
      original._retried = true
      const refresh_token = localStorage.getItem('refresh_token')

      if (refresh_token) {
        try {
          const { data } = await axios.post(
            `${original.baseURL || 'http://localhost:8000'}/api/auth/refresh`,
            { refresh_token }
          )
          localStorage.setItem('id_token',      data.id_token)
          localStorage.setItem('refresh_token', data.refresh_token)
          original.headers.Authorization = `Bearer ${data.id_token}`
          return api(original) // retry
        } catch {
          // refresh failed — clear session, redirect to home
          localStorage.removeItem('id_token')
          localStorage.removeItem('refresh_token')
          localStorage.removeItem('user_info')
        }
      }
    }

    return Promise.reject(error)
  }
)

// ── Helpers ───────────────────────────────────────────────────────────────────
export async function getCurrentUser() {
  try {
    const { data } = await api.get('/api/auth/me')
    return data
  } catch {
    return null
  }
}

export async function syncUser() {
  // No-op with new backend-auth system; kept for backward compat
  return null
}

export function logout() {
  localStorage.removeItem('id_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('user_info')
}

export default api
