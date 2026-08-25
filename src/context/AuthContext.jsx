/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback } from 'react'
import authService from '../services/authService'
import {
  setToken,
  setRefreshToken,
  setUser,
  getUser,
  getToken,
  clearAuth,
} from '../utils/storage'
import { getRoleRedirect } from '../utils/helpers'
import { useEffect } from 'react'

const AuthContext = createContext(null)

const getInitialUser = () => {
  const storedUser = getUser()
  const storedToken = getToken()
  return storedUser && storedToken ? storedUser : null
}

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(getInitialUser)
  const [loading, setLoading] = useState(Boolean(getToken()))
  useEffect(() => {
    const token = getToken()
    if (!token) { setLoading(false); return }

    authService.getMe()
      .then((res) => { setUser(res.user); setUserState(res.user) })
      .catch(() => { clearAuth(); setUserState(null) })
      .finally(() => setLoading(false))
  }, [])

  const applySession = useCallback((session) => {
    setToken(session.accessToken)
    setRefreshToken(session.refreshToken)
    setUser(session.user)
    setUserState(session.user)
    return session.user
  }, [])

  const login = useCallback(async (credentials) => {
    const session = await authService.login(credentials)
    return applySession(session)
  }, [applySession])

  const register = useCallback(async (formData) => {
    const session = await authService.register(formData)
    return applySession(session)
  }, [applySession])

  const updateUser = useCallback((nextUser) => {
    setUser(nextUser)
    setUserState(nextUser)
    return nextUser
  }, [])

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } finally {
      clearAuth()
      setUserState(null)
    }
  }, [])

  const isRole = useCallback((role) => user?.role === role, [user])
  const isAuthenticated = Boolean(user && getToken())

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateUser,
        isRole,
        isAuthenticated,
        getRoleRedirect,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

export default AuthContext
