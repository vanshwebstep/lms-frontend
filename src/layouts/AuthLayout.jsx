import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getRoleRedirect } from '../utils/helpers'
import Loader from '../components/common/Loader'

const AuthLayout = () => {
  const { isAuthenticated, user, loading } = useAuth()
  const location = useLocation()
  
  const isWidePage = location.pathname.includes('/login/') || location.pathname === '/login'

  if (loading) return <Loader fullScreen />
  if (isAuthenticated && user?.role) {
    return <Navigate to={getRoleRedirect(user.role)} replace />
  }

  return (
    <div className="auth-layout">
      <div className="auth-content" style={{ maxWidth: isWidePage ? '1024px' : '460px' }}>
        <Outlet />
      </div>
    </div>
  )
}

export default AuthLayout
