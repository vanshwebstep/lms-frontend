import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Eye, EyeOff, Lock, ShieldCheck } from 'lucide-react'
import authService from '../../services/authService'
import toast from 'react-hot-toast'
import './auth.css'

const ResetPassword = () => {
  const { token } = useParams()
  const navigate = useNavigate()

  const [form, setForm] = useState({ password: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [done, setDone] = useState(false)

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.password) return toast.error('Enter a new password')
    if (form.password.length < 6) {
      return toast.error('Password must be at least 6 characters')
    }
    if (form.password !== form.confirmPassword) {
      return toast.error('Passwords do not match')
    }

    setLoading(true)

    try {
      await authService.resetPassword(token, form.password)
      setDone(true)
      toast.success('Password reset successfully')
      setTimeout(() => navigate('/login'), 1800)
    } catch (err) {
      toast.error(err?.message || 'Invalid or expired reset link')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-card animate-slideUp">
      <div className="auth-logo">
        <div className="auth-logo-icon">
          <ShieldCheck size={25} />
        </div>
        <span className="auth-logo-text">LearnFlow</span>
      </div>

      {done ? (
        <div className="auth-success-state">
          <div className="auth-success-icon">
            <ShieldCheck size={30} />
          </div>

          <h2 className="auth-title">Password updated</h2>
          <p className="auth-subtitle">Redirecting you to login...</p>
        </div>
      ) : (
        <>
          <h1 className="auth-title">Reset password</h1>
          <p className="auth-subtitle">Enter your new local account password</p>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label" htmlFor="reset-password">New Password</label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={16} />
                <input
                  id="reset-password"
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Min. 6 characters"
                  autoComplete="new-password"
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

            <div className="form-group">
              <label className="form-label" htmlFor="reset-confirm-password">Confirm New Password</label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={16} />
                <input
                  id="reset-confirm-password"
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Repeat new password"
                  autoComplete="new-password"
                />
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <span className="btn-spinner" />
                  Updating...
                </>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>

          <p className="auth-footer-text">
            <Link to="/login" className="form-link">
              Back to Login
            </Link>
          </p>
        </>
      )}
    </div>
  )
}

export default ResetPassword
