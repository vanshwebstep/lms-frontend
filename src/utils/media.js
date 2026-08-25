import API_CONFIG from '../config/api.config'

export const resolveMediaUrl = (url = '') => {
  if (!url) return ''
  if (/^(https?:)?\/\//i.test(url) || url.startsWith('data:') || url.startsWith('blob:')) return url

  const backendBase = API_CONFIG.BASE_URL.replace(/\/api\/?$/, '').replace(/\/$/, '')
  const path = url.startsWith('/') ? url : `/${url}`
  return `${backendBase}${path}`
}