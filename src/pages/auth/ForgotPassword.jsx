import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ShieldCheck } from 'lucide-react'
import authService from '../../services/authService'
import toast from 'react-hot-toast'
import './auth.css'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [resetLink, setResetLink] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) return toast.error('Enter your email address')

    setLoading(true)
    try {
      const result = await authService.forgotPassword(email)
      setResetLink(`/reset-password/${result.resetToken}`)
      toast.success('Reset link is ready')
    } catch (err) {
      toast.error(err?.message || 'Something went wrong')
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

      {resetLink ? (
        <div className="auth-success-state">
          <div className="auth-success-icon">
            <Mail size={30} />
          </div>

          <h2 className="auth-title">Reset link ready</h2>
          <p className="auth-subtitle">
            Open the generated reset screen for <strong>{email}</strong>.
          </p>

          <Link to={resetLink} className="btn-primary auth-link-button">
            Open Reset Screen
          </Link>

          <Link to="/login" className="form-link auth-secondary-link">
            Back to Login
          </Link>
        </div>
      ) : (
        <>
          <h1 className="auth-title">Forgot password?</h1>
          <p className="auth-subtitle">Generate a local reset link for this frontend build</p>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label" htmlFor="forgot-email">Email Address</label>
              <div className="input-wrapper">
                <Mail className="input-icon" size={16} />
                <input
                  id="forgot-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  placeholder="you@example.com"
                  autoComplete="email"
                  autoFocus
                />
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? (<><span className="btn-spinner" />Generating...</>) : 'Generate Reset Link'}
            </button>
          </form>

          <p className="auth-footer-text">
            Remember your password? <Link to="/login" className="form-link">Sign in</Link>
          </p>
        </>
      )}
    </div>
  )
}

export default ForgotPassword
