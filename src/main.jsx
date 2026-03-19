import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import axios from 'axios'
import { API_BASE_URL } from './runtimeConfig'

axios.defaults.baseURL = API_BASE_URL
// Attach Authorization header from localStorage token if present
axios.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('tellme_token')
    if (token) config.headers = { ...config.headers, Authorization: `Bearer ${token}` }
  } catch (e) {
    // ignore
  }
  return config
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
