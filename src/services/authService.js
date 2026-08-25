import API_CONFIG from '../config/api.config'
import { getRefreshToken } from '../utils/storage'
import api from './api'


const authService = {

  login: (credentials) => api.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, credentials),

  register: (data) => api.post(API_CONFIG.ENDPOINTS.AUTH.REGISTER, data, data instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined),

  logout: () =>
    api.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT, {
      refreshToken: getRefreshToken(),
    }),

  forgotPassword: (email) =>
    api.post(API_CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD, { email }),

  resetPassword: (token, password) =>
    api.post(API_CONFIG.ENDPOINTS.AUTH.RESET_PASSWORD, { token, password }),

  verifyEmail: (token) =>
    api.post(API_CONFIG.ENDPOINTS.AUTH.VERIFY_EMAIL, { token }),

  getMe: () => api.get(API_CONFIG.ENDPOINTS.AUTH.ME),

  refreshToken: () =>
    api.post(API_CONFIG.ENDPOINTS.AUTH.REFRESH_TOKEN, {
      refreshToken: getRefreshToken(),
    }),

  changePassword: ({ oldPassword, newPassword }) =>
    api.post('/auth/change-password', { oldPassword, newPassword }),

  requestPasswordOtp: (email) =>
    api.post('/auth/request-password-otp', { email }),

  changePasswordWithOtp: ({ email, otp, newPassword }) =>
    api.post('/auth/change-password-with-otp', { email, otp, newPassword }),
}

export default authService
