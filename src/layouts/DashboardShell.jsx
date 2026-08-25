import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Search,
  ShieldCheck,
  X,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { formatDateTime } from '../utils/formatters'
import { resolveMediaUrl } from '../utils/media'

const accentClasses = {
  admin: {
    chip: 'bg-emerald-500/10 text-emerald-200 ring-emerald-400/20',
    active: 'bg-emerald-500/15 text-white ring-1 ring-emerald-400/25',
    icon: 'bg-emerald-400 text-slate-950',
  },
  coach: {
    chip: 'bg-amber-500/10 text-amber-200 ring-amber-400/20',
    active: 'bg-amber-500/15 text-white ring-1 ring-amber-400/25',
    icon: 'bg-amber-400 text-slate-950',
  },
  student: {
    chip: 'bg-sky-500/10 text-sky-200 ring-sky-400/20',
    active: 'bg-sky-500/15 text-white ring-1 ring-sky-400/25',
    icon: 'bg-sky-400 text-slate-950',
  },
}

export default function DashboardShell({
  navItems,
  label,
  title,
  subtitle,
  accent = 'admin',
  profilePath,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const searchRef = useRef(null)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const palette = accentClasses[accent] || accentClasses.admin
  const unreadCount = notifications.filter((item) => !item.is_read).length

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  const loadNotifications = async () => {
    try {
      const res = await api.get('/notifications')
      setNotifications(res.notifications || [])
    } catch {
      setNotifications([])
    }
  }

  useEffect(() => {
    if (!searchTerm.trim()) return
    const timer = setTimeout(async () => {
      try {
        const res = await api.get(`/search?q=${encodeURIComponent(searchTerm.trim())}`)
        setSearchResults(res)
        setSearchOpen(true)
      } catch {
        setSearchResults(null)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const getSearchTarget = (group, item) => {
    const role = user?.role
    if (group === 'courses') {
      if (role === 'coach') return `/coach/course-detail/${item.id}`
      if (role === 'student') return `/student/courses/${item.id}`
      return `/admin/courses/${item.id}`
    }
    if (group === 'students') {
      if (role === 'coach') return '/coach/my-students'
      return '/admin/students'
    }
    if (group === 'coaches') {
      if (role === 'student') return '/student/courses'
      return '/admin/coaches'
    }
    if (group === 'payments') {
      if (role === 'coach') return '/coach/earnings'
      if (role === 'student') return '/student/my-learning'
      return '/admin/payments'
    }
    return null
  }

  const handleSearchSelect = (group, item) => {
    const target = getSearchTarget(group, item)
    if (!target) return
    setSearchOpen(false)
    setSearchTerm('')
    setSearchResults(null)
    navigate(target)
  }
  useEffect(() => {
    const onClick = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) setSearchOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  return (
    <div className="flex min-h-screen bg-[#f5f7fb] text-slate-950">
      <aside
        className={`${sidebarOpen ? 'w-72' : 'w-24'
          } flex shrink-0 flex-col border-r border-white/10 bg-[#111827] text-slate-300 transition-all duration-300`}
      >
        <div className="border-b border-white/10 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${palette.icon}`}>
              <ShieldCheck size={21} />
            </div>
            {sidebarOpen && (
              <div className="min-w-0">
                <p className="truncate text-base font-black tracking-tight text-white">LearnFlow</p>
                <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ring-1 ${palette.chip}`}>
                  {label}
                </span>
              </div>
            )}
            <button
              type="button"
              onClick={() => setSidebarOpen((open) => !open)}
              className="ml-auto rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white"
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map(({ path, label: navLabel, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${isActive
                  ? palette.active
                  : 'text-slate-400 hover:bg-white/8 hover:text-white'
                }`
              }
              title={!sidebarOpen ? navLabel : undefined}
            >
              <Icon size={19} className="shrink-0" />
              {sidebarOpen && <span className="truncate">{navLabel}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 p-3">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-rose-200 hover:bg-rose-500/10 hover:text-white"
          >
            <LogOut size={19} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="relative z-[80] border-b border-slate-200/80 bg-white/90 px-5 py-3 backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <h1 className="truncate text-lg font-black tracking-tight text-slate-950">{title}</h1>
              <p className="truncate text-xs font-medium text-slate-500">{subtitle}</p>
            </div>

            <div ref={searchRef} className="relative z-[90] hidden min-w-[280px] max-w-sm flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 lg:flex">
              <Search size={16} />
              <input
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value)
                  if (!event.target.value.trim()) setSearchResults(null)
                }}
                onFocus={() => setSearchOpen(true)}
                placeholder="Search courses, users, reports..."
                className="min-w-0 flex-1 bg-transparent text-sm outline-none"
              />
              {searchOpen && searchTerm && searchResults && (
                <div className="absolute left-0 right-0 top-11 z-[999] max-h-96 overflow-auto rounded-lg border border-slate-200 bg-white p-2 shadow-xl">
                  {['courses', 'students', 'coaches', 'payments'].map((group) => (
                    <div key={group} className="mb-2 last:mb-0">
                      <p className="px-2 py-1 text-[11px] font-black uppercase text-slate-400">{group}</p>
                      {(searchResults[group] || []).slice(0, 5).map((item) => (
                        <button
                          key={`${group}-${item.id || item.orderId}`}
                          type="button"
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => handleSearchSelect(group, item)}
                          className="block w-full rounded-md px-2 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 focus:bg-slate-50 focus:outline-none"
                        >
                          <p className="font-bold">{item.title || item.name || item.orderId || item.id}</p>
                          <p className="truncate text-slate-400">{item.email || item.category || item.status || item.description || ''}</p>
                        </button>
                      ))}
                    </div>
                  ))}
                  {['courses', 'students', 'coaches', 'payments'].every((group) => !(searchResults[group] || []).length) && (
                    <p className="px-3 py-4 text-center text-xs text-slate-400">No results found</p>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setNotificationOpen((open) => !open)
                    if (!notificationOpen) loadNotifications()
                  }}
                  className="relative rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50"
                  aria-label="Notifications"
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-black leading-none text-white ring-2 ring-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {notificationOpen && (
                  <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl">
                    <div className="border-b border-slate-100 px-4 py-3">
                      <p className="text-sm font-black text-slate-800">Notifications</p>
                    </div>
                    {notifications.length === 0 ? (
                      <p className="px-4 py-5 text-center text-xs font-semibold text-slate-400">No notifications yet</p>
                    ) : (
                      <div className="max-h-80 overflow-auto divide-y divide-slate-100">
                        {notifications.slice(0, 8).map((item) => (
                          <div key={item.id} className="px-4 py-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-bold text-slate-800">{item.title}</p>
                                <p className="mt-1 line-clamp-2 text-xs text-slate-500">{item.message}</p>
                              </div>
                              {!item.is_read && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-rose-500" />}
                            </div>
                            <p className="mt-2 text-[11px] font-semibold text-slate-400">
                              {item.created_at ? formatDateTime(item.created_at) : ''}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setDropdownOpen((open) => !open)}
                  className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-2 hover:bg-slate-50"
                >
                  <div className="h-8 w-8 overflow-hidden rounded-lg bg-slate-950 text-sm font-black text-white">
                    {resolveMediaUrl(user?.avatar) ? (
                      <img src={resolveMediaUrl(user.avatar)} alt={user?.name || 'User'} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">{user?.name?.[0]?.toUpperCase() || 'U'}</div>
                    )}
                  </div>
                  <span className="hidden text-sm font-bold text-slate-700 sm:inline">
                    {user?.name || 'User'}
                  </span>
                  <ChevronDown size={15} className="text-slate-500" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl">
                    {profilePath && (
                      <NavLink
                        to={profilePath}
                        className="block px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Profile
                      </NavLink>
                    )}
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full px-4 py-2.5 text-left text-sm font-semibold text-rose-600 hover:bg-rose-50"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-5 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}