import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, GraduationCap, Lock, Mail, ArrowLeft } from 'lucide-react'
import { useAuth } from '../../../context/AuthContext'
import { getRoleRedirect } from '../../../utils/helpers'
import toast from 'react-hot-toast'

const StudentLogin = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname

  const [form, setForm] = useState({ email: '', password: '', role: 'student' })
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) return toast.error('Please fill all fields')
    setLoading(true)
    try {
      const user = await login(form)
      toast.success(`Welcome back, ${user.name}!`)
      navigate(from || getRoleRedirect(user.role), { replace: true })
    } catch (err) {
      toast.error(err?.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex w-full min-h-[500px] bg-white rounded-2xl overflow-hidden shadow-xl animate-slideUp">
      <div className="w-1/2 hidden md:flex flex-col justify-center items-center p-10 bg-gradient-to-br from-indigo-500 to-purple-600 text-white relative">
        <div className="absolute top-6 left-6 flex items-center gap-2">
            <GraduationCap size={24} />
            <span className="font-bold text-xl tracking-tight">LearnFlow</span>
        </div>
        <GraduationCap size={80} className="mb-6 opacity-90" />
        <h2 className="text-4xl font-bold mb-4 text-center">Student Portal</h2>
        <p className="text-lg text-center text-indigo-100 max-w-sm">
          Access your enrolled courses, pick up where you left off, and track your progress.
        </p>
      </div>
      <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center relative bg-gray-50">
        <Link to="/login" className="absolute top-6 left-6 text-gray-500 hover:text-indigo-600 flex items-center gap-2 transition-colors">
          <ArrowLeft size={16} /> <span className="text-sm font-medium">Roles</span>
        </Link>
        <div className="text-center mb-8 mt-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 mb-4 md:hidden">
            <GraduationCap size={24} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-500">Sign in to your learning account</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Mail size={18} />
              </div>
              <input
                id="email" type="email" name="email" value={form.email} onChange={handleChange}
                className="pl-10 w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white"
                placeholder="student@example.com" autoComplete="email"
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700" htmlFor="password">Password</label>
              <Link to="/forgot-password" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">Forgot password?</Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Lock size={18} />
              </div>
              <input
                id="password" type={showPass ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange}
                className="pl-10 pr-10 w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white"
                placeholder="••••••••" autoComplete="current-password"
              />
              <button
                type="button" onClick={() => setShowPass(!showPass)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors mt-2">
            {loading ? <span className="btn-spinner border-white mr-2" /> : null}
            {loading ? 'Signing in...' : 'Sign In as Student'}
          </button>
        </form>
        
        <p className="mt-8 text-center text-sm text-gray-600">
          New here? <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">Create a student account</Link>
        </p>
      </div>
    </div>
  )
}
export default StudentLogin
