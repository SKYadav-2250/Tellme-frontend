const trimTrailingSlash = (value = '') => value.replace(/\/+$/, '')

const DEFAULT_DEV_BACKEND_URL = 'http://localhost:5000'
const DEFAULT_PROD_BACKEND_URL = 'https://tell-me-backend.onrender.com'

const fallbackBackendUrl = import.meta.env.DEV
  ? DEFAULT_DEV_BACKEND_URL
  : DEFAULT_PROD_BACKEND_URL

export const API_BASE_URL = trimTrailingSlash(
  import.meta.env.VITE_API_URL || fallbackBackendUrl,
)

export const SOCKET_BASE_URL = trimTrailingSlash(
  import.meta.env.VITE_SOCKET_URL || API_BASE_URL,
)
