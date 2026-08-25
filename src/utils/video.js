export const resolveVideoUrl = (url = '') => String(url || '').trim()

export const getYouTubeId = (url = '') => {
  const value = String(url || '').trim()
  const match = value.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/i)
  return match?.[1] || ''
}

export const getVimeoId = (url = '') => {
  const value = String(url || '').trim()
  const match = value.match(/vimeo\.com\/(?:video\/)?(\d+)/i)
  return match?.[1] || ''
}

export const getYouTubeEmbedUrl = (url = '', { compact = false } = {}) => {
  const id = getYouTubeId(url)
  if (!id) return ''
  return compact
    ? `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&controls=0&playsinline=1&rel=0&loop=1&playlist=${id}`
    : `https://www.youtube.com/embed/${id}`
}

export const getVimeoEmbedUrl = (url = '', { compact = false } = {}) => {
  const id = getVimeoId(url)
  if (!id) return ''
  return compact
    ? `https://player.vimeo.com/video/${id}?background=1&autoplay=1&muted=1&loop=1`
    : `https://player.vimeo.com/video/${id}`
}

export const getVideoEmbedUrl = (url = '', options = {}) => getYouTubeEmbedUrl(url, options) || getVimeoEmbedUrl(url, options)

export const isDirectVideoUrl = (url = '') => {
  const value = String(url || '').split('?')[0].toLowerCase()
  return /\.(mp4|webm|ogg|ogv|mov)$/.test(value) || value.startsWith('blob:') || value.startsWith('data:video/')
}