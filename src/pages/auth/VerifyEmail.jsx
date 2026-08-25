import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import authService from '../../services/authService'
import Loader from '../../components/common/Loader'
import './auth.css'

const VerifyEmail = () => {
  const { token } = useParams()
  const [status, setStatus] = useState('loading') // loading | success | error

  useEffect(() => {
    const verify = async () => {
      try {
        await authService.verifyEmail(token)
        setStatus('success')
      } catch {
        setStatus('error')
      }
    }

    verify()
  }, [token])

  return (
    <div className="auth-card animate-slideUp">
      <div className="auth-logo">
        <div className="auth-logo-icon">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path
              d="M14 2L26 8V20L14 26L2 20V8L14 2Z"
              fill="var(--color-primary)"
              opacity="0.2"
            />
            <path
              d="M14 2L26 8V20L14 26L2 20V8L14 2Z"
              stroke="var(--color-primary)"
              strokeWidth="1.5"
            />
            <path
              d="M9 14L12.5 17.5L19 11"
              stroke="var(--color-accent)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <span className="auth-logo-text">LearnFlow</span>
      </div>

      {status === 'loading' && (
        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
          <Loader size="md" text="Verifying your email..." />
        </div>
      )}

      {status === 'success' && (
        <div className="auth-success-state">
          <div className="auth-success-icon">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-success)"
              strokeWidth="2"
            >
              <polyline points="20,6 9,17 4,12" />
            </svg>
          </div>

          <h2 className="auth-title">Email Verified!</h2>
          <p className="auth-subtitle">
            Your account is now active. You can sign in.
          </p>

          <Link
            to="/login"
            className="btn-primary"
            style={{
              display: 'block',
              textAlign: 'center',
              marginTop: '1.5rem',
              textDecoration: 'none',
            }}
          >
            Go to Login
          </Link>
        </div>
      )}

      {status === 'error' && (
        <div className="auth-success-state">
          <div
            className="auth-success-icon"
            style={{ background: 'var(--color-error-bg)' }}
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-error)"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>

          <h2 className="auth-title">Link Invalid</h2>
          <p className="auth-subtitle">
            This verification link has expired or is invalid.
          </p>

          <Link
            to="/login"
            className="btn-primary"
            style={{
              display: 'block',
              textAlign: 'center',
              marginTop: '1.5rem',
              textDecoration: 'none',
            }}
          >
            Back to Login
          </Link>
        </div>
      )}
    </div>
  )
}

export default VerifyEmail