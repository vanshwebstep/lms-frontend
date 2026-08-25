import { LOCAL_KEYS } from './constants'

export const storage = {
  get: (key) => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch {
      return null
    }
  },

  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      return null
    }
  },

  remove: (key) => {
    localStorage.removeItem(key)
  },

  clear: () => {
    localStorage.clear()
  },
}

// Token helpers
export const getToken = () => storage.get(LOCAL_KEYS.TOKEN)
export const setToken = (token) => storage.set(LOCAL_KEYS.TOKEN, token)
export const removeToken = () => storage.remove(LOCAL_KEYS.TOKEN)

export const getRefreshToken = () => storage.get(LOCAL_KEYS.REFRESH)
export const setRefreshToken = (token) => storage.set(LOCAL_KEYS.REFRESH, token)

export const getUser = () => storage.get(LOCAL_KEYS.USER)
export const setUser = (user) => storage.set(LOCAL_KEYS.USER, user)
export const removeUser = () => storage.remove(LOCAL_KEYS.USER)

export const clearAuth = () => {
  storage.remove(LOCAL_KEYS.TOKEN)
  storage.remove(LOCAL_KEYS.REFRESH)
  storage.remove(LOCAL_KEYS.USER)
}
