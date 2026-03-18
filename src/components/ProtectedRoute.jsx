import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    // Redirect unauthenticated users to the dashboard first,
    // preserve the intended URL so login can take them there afterwards
    return (
      <Navigate
        to={`/dashboard?redirect=${encodeURIComponent(location.pathname)}`}
        replace
      />
    )
  }

  return children
}

export default ProtectedRoute
