export const classNames = (...classes) =>
  classes.filter(Boolean).join(' ')

export const truncate = (str, n = 100) =>
  str?.length > n ? str.substring(0, n) + '...' : str

export const getInitials = (name = '') =>
  name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

export const slugify = (str) =>
  str.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')

export const sleep = (ms) => new Promise(r => setTimeout(r, ms))

export const debounce = (fn, delay = 300) => {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

export const groupBy = (arr, key) =>
  arr.reduce((acc, item) => {
    const group = item[key]
    acc[group] = acc[group] || []
    acc[group].push(item)
    return acc
  }, {})

export const calculateProgress = (completed, total) =>
  total === 0 ? 0 : Math.round((completed / total) * 100)

export const getRoleRedirect = (role) => {
  const map = {
    superadmin: '/admin/dashboard',
    coach: '/coach/dashboard',
    student: '/student/dashboard'
  }
  return map[role] || '/login'
}