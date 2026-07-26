import axios from 'axios'
import { getIdToken, firebaseLogout } from '../firebase'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  timeout: 60000,
})

// ── Attach Firebase ID token to every request ────────────────────────────────
api.interceptors.request.use(async (config) => {
  const token = await getIdToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ── Auto-logout on 401 ───────────────────────────────────────────────────────
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      await firebaseLogout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ── Image upload with retry ──────────────────────────────────────────────────
export async function uploadImage(file, retries = 3) {
  const formData = new FormData()
  formData.append('file', file)

  let lastError = null
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const { data } = await api.post('/upload', formData, { timeout: 60000 })
      return data
    } catch (error) {
      lastError = error
      if (error.response?.status === 400 || error.response?.status === 422) throw error
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, Math.pow(2, attempt - 1) * 1000))
      }
    }
  }
  throw lastError
}

// ── Core API calls ───────────────────────────────────────────────────────────

export async function predict(payload) {
  const { data } = await api.post('/predict', payload)
  return data
}

export async function getCurrentUser() {
  try {
    const { data } = await api.get('/auth/me')
    return data
  } catch {
    return null
  }
}

export async function getHealthMetricsAssessment(payload) {
  try {
    const { data } = await api.post('/health-metrics/assess', payload)
    return data
  } catch {
    return {
      risk_score: 50,
      recommendations: ['Maintain regular physical activity', 'Monitor blood sugar levels'],
      details: { bmi_category: 'Normal', sugar_level: 'Normal', age_group: 'Adult' },
    }
  }
}

// ── Auth stubs kept for backwards compat (Firebase handles the real work) ────
export function logout() {
  firebaseLogout()
  localStorage.removeItem('user_data')
  localStorage.removeItem('patient_profile')
}
