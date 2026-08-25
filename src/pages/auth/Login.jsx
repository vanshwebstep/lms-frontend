import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, GraduationCap, Lock, Mail, ShieldCheck, UserCog } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { getRoleRedirect } from '../../utils/helpers'
import toast from 'react-hot-toast'
import './auth.css'

const ROLE_OPTIONS = [
  {
    value: 'student',
    label: 'Student',
    title: 'Student learning portal',
    subtitle: 'Access enrolled courses, lessons, quizzes, assignments, and checkout.',
    Icon: GraduationCap,
    className: 'auth-card-student',
  },
  {
    value: 'coach',
    label: 'Coach',
    title: 'Coach course studio',
    subtitle: 'Create courses, manage learning content, students, revenue, and uploads.',
    Icon: UserCog,
    className: 'auth-card-coach',
  },
  {
    value: 'superadmin',
    label: 'Admin',
    title: 'Admin control panel',
    subtitle: 'Manage coaches, students, courses, payments, search, and notifications.',
    Icon: ShieldCheck,
    className: 'auth-card-admin',
  },
]

const Login = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname

  const [form, setForm] = useState({ email: '', password: '', role: 'student' })
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const activeRole = ROLE_OPTIONS.find((role) => role.value === form.role) || ROLE_OPTIONS[0]
  const ActiveIcon = activeRole.Icon

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }))

  const handleRoleSelect = (role) =>
    setForm((p) => ({ ...p, role }))

  const finishLogin = async (credentials) => {
    const user = await login(credentials)
    toast.success(`Welcome back, ${user.name}!`)
    navigate(from || getRoleRedirect(user.role), { replace: true })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.email || !form.password) {
      toast.error('Please fill all fields')
      return
    }

    setLoading(true)

    try {
      await finishLogin(form)
    } catch (err) {
      toast.error(err?.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`auth-card animate-slideUp ${activeRole.className}`}>
      <div className="auth-logo">
        <div className="auth-logo-icon">
          <ActiveIcon size={25} />
        </div>
        <span className="auth-logo-text">LearnFlow</span>
      </div>

      <div className="auth-role-panel">
        <p className="auth-role-kicker">{activeRole.label} Login</p>
        <h1 className="auth-title">{activeRole.title}</h1>
        <p className="auth-subtitle">{activeRole.subtitle}</p>
      </div>

      <div className="role-selector auth-role-tabs" aria-label="Choose login role">
        {ROLE_OPTIONS.map(({ value, label, Icon }) => (
          <button
            key={value}
            type="button"
            className={`role-option auth-role-tab ${form.role === value ? 'selected' : ''}`}
            onClick={() => handleRoleSelect(value)}
            aria-pressed={form.role === value}
          >
            <span className="role-icon"><Icon size={17} /></span>
            <span className="role-label">{label}</span>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label className="form-label" htmlFor="login-email">Email Address</label>
          <div className="input-wrapper">
            <Mail className="input-icon" size={16} />
            <input
              id="login-email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="form-input"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
        </div>

        <div className="form-group">
          <div className="form-label-row">
            <label className="form-label" htmlFor="login-password">Password</label>
            <Link to="/forgot-password" className="form-link">
              Forgot password?
            </Link>
          </div>

          <div className="input-wrapper">
            <Lock className="input-icon" size={16} />
            <input
              id="login-password"
              type={showPass ? 'text' : 'password'}
              name="password"
              value={form.password}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter your password"
              autoComplete="current-password"
            />

            <button
              type="button"
              className="input-toggle"
              onClick={() => setShowPass((p) => !p)}
              aria-label={showPass ? 'Hide password' : 'Show password'}
            >
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? (
            <>
              <span className="btn-spinner" />
              Signing in...
            </>
          ) : (
            `Sign in as ${activeRole.label}`
          )}
        </button>
      </form>

      <p className="auth-footer-text">
        Student account needed?{' '}
        <Link to="/register" className="form-link">
          Create student account
        </Link>
      </p>
    </div>
  )
}

export default Login