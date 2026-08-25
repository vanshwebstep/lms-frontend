import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Loader from '../components/common/Loader'
import { getRoleRedirect } from '../utils/helpers'

const RootRedirect = () => {
  const { isAuthenticated, user, loading } = useAuth()

  if (loading) return <Loader fullScreen />

  return (
    <Navigate
      to={isAuthenticated ? getRoleRedirect(user?.role) : '/login'}
      replace
    />
  )
}

export default RootRedirect
