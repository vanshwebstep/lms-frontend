import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BookOpen, Camera, Eye, EyeOff, Lock, Mail, MapPin, Phone, ShieldCheck, User } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { ROLES } from '../../utils/constants'
import { getRoleRedirect } from '../../utils/helpers'
import toast from 'react-hot-toast'
import './auth.css'

const Register = () => {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    education: '',
    password: '',
    confirmPassword: '',
    role: ROLES.STUDENT,
    faceImage: null,
  })
  const [preview, setPreview] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }))

  const handleFaceImage = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return toast.error('Please select a valid face image')
    setForm((p) => ({ ...p, faceImage: file }))
    setPreview(URL.createObjectURL(file))
  }

  const handleNext = (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim() || !form.city.trim() || !form.education.trim()) {
      toast.error('Please fill all student details')
      return
    }
    if (!form.faceImage) {
      toast.error('Student face image is required')
      return
    }
    setStep(2)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.password) return toast.error('Enter a password')
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters')
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match')

    const payload = new FormData()
    payload.append('name', form.name)
    payload.append('email', form.email)
    payload.append('phone', form.phone)
    payload.append('city', form.city)
    payload.append('education', form.education)
    payload.append('password', form.password)
    payload.append('role', ROLES.STUDENT)
    payload.append('faceImage', form.faceImage)

    setLoading(true)
    try {
      const user = await register(payload)
      toast.success(`Account created, ${user.name}!`)
      navigate(getRoleRedirect(user.role), { replace: true })
    } catch (err) {
      toast.error(err?.message || 'Registration failed')
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

      <div className="auth-steps">
        <div className={`auth-step ${step >= 1 ? 'active' : ''}`}>1</div>
        <div className="auth-step-line" />
        <div className={`auth-step ${step >= 2 ? 'active' : ''}`}>2</div>
      </div>

      <h1 className="auth-title">{step === 1 ? 'Create student account' : 'Set your password'}</h1>
      <p className="auth-subtitle">{step === 1 ? 'Face image and basic student details are required' : 'Coach accounts are created by admin only'}</p>

      {step === 1 ? (
        <form onSubmit={handleNext} className="auth-form">
          <label className="student-photo-picker">
            <input type="file" accept="image/*" className="hidden" onChange={handleFaceImage} />
            <span className="student-photo-preview">
              {preview ? <img src={preview} alt="Student face" /> : <Camera size={28} />}
            </span>
            <span className="student-photo-copy">
              <strong>Student face image</strong>
              <small>Required for student verification and profile display</small>
            </span>
          </label>

          <div className="form-group">
            <label className="form-label" htmlFor="register-name">Full Name</label>
            <div className="input-wrapper"><User className="input-icon" size={16} /><input id="register-name" type="text" name="name" value={form.name} onChange={handleChange} className="form-input" placeholder="Your full name" autoComplete="name" /></div>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="register-email">Email Address</label>
            <div className="input-wrapper"><Mail className="input-icon" size={16} /><input id="register-email" type="email" name="email" value={form.email} onChange={handleChange} className="form-input" placeholder="you@example.com" autoComplete="email" /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label" htmlFor="register-phone">Phone</label><div className="input-wrapper"><Phone className="input-icon" size={16} /><input id="register-phone" type="tel" name="phone" value={form.phone} onChange={handleChange} className="form-input" placeholder="Phone number" /></div></div>
            <div className="form-group"><label className="form-label" htmlFor="register-city">City</label><div className="input-wrapper"><MapPin className="input-icon" size={16} /><input id="register-city" type="text" name="city" value={form.city} onChange={handleChange} className="form-input" placeholder="City" /></div></div>
          </div>
          <div className="form-group"><label className="form-label" htmlFor="register-education">Education</label><div className="input-wrapper"><BookOpen className="input-icon" size={16} /><input id="register-education" type="text" name="education" value={form.education} onChange={handleChange} className="form-input" placeholder="e.g. B.Tech, Class 12, MBA" /></div></div>
          <button type="submit" className="btn-primary">Continue</button>
        </form>
      ) : (
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="rounded-xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-700">Student self-registration only. Coach accounts are created by admin.</div>
          <div className="form-group"><label className="form-label" htmlFor="register-password">Password</label><div className="input-wrapper"><Lock className="input-icon" size={16} /><input id="register-password" type={showPass ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} className="form-input" placeholder="Min. 6 characters" autoComplete="new-password" /><button type="button" className="input-toggle" onClick={() => setShowPass((p) => !p)} aria-label={showPass ? 'Hide password' : 'Show password'}>{showPass ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></div>
          <div className="form-group"><label className="form-label" htmlFor="register-confirm-password">Confirm Password</label><div className="input-wrapper"><Lock className="input-icon" size={16} /><input id="register-confirm-password" type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} className="form-input" placeholder="Repeat password" autoComplete="new-password" /></div></div>
          <div className="form-row"><button type="button" className="btn-secondary" onClick={() => setStep(1)}>Back</button><button type="submit" className="btn-primary" disabled={loading}>{loading ? <><span className="btn-spinner" />Creating...</> : 'Create Account'}</button></div>
        </form>
      )}

      <p className="auth-footer-text">Already have an account? <Link to="/login" className="form-link">Sign in</Link></p>
    </div>
  )
}

export default Register