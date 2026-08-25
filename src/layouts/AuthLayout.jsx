import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getRoleRedirect } from '../utils/helpers'
import Loader from '../components/common/Loader'

const AuthLayout = () => {
  const { isAuthenticated, user, loading } = useAuth()

  if (loading) return <Loader fullScreen />
  if (isAuthenticated && user?.role) {
    return <Navigate to={getRoleRedirect(user.role)} replace />
  }

  return (
    <div className="auth-layout">

      <div className="auth-content">
        <Outlet />
      </div>
    </div>
  )
}

export default AuthLayout
