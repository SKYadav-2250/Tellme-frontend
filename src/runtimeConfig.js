const trimTrailingSlash = (value = '') => value.replace(/\/+$/, '')



export const API_BASE_URL = trimTrailingSlash(
  import.meta.env.VITE_API_URL,
)

export const SOCKET_BASE_URL = trimTrailingSlash(
  import.meta.env.VITE_SOCKET_URL || API_BASE_URL,
)
