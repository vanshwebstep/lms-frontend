import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, ShieldCheck, Lock, Mail, ArrowLeft } from 'lucide-react'
import { useAuth } from '../../../context/AuthContext'
import { getRoleRedirect } from '../../../utils/helpers'
import toast from 'react-hot-toast'

const AdminLogin = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname

  const [form, setForm] = useState({ email: '', password: '', role: 'superadmin' })
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) return toast.error('Please fill all fields')
    setLoading(true)
    try {
      const user = await login(form)
      toast.success(`Welcome back, Admin!`)
      navigate(from || getRoleRedirect(user.role), { replace: true })
    } catch (err) {
      toast.error(err?.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex w-full min-h-[500px] bg-slate-900 rounded-2xl overflow-hidden shadow-2xl animate-slideUp">
      <div className="w-1/2 hidden md:flex flex-col justify-center items-center p-10 bg-slate-800 text-white relative border-r border-slate-700">
        <div className="absolute top-6 left-6 flex items-center gap-2 text-emerald-400">
            <ShieldCheck size={24} />
            <span className="font-bold text-xl tracking-tight text-white">LearnFlow</span>
        </div>
        <ShieldCheck size={80} className="mb-6 text-emerald-400 opacity-90" />
        <h2 className="text-4xl font-bold mb-4 text-center">Admin Panel</h2>
        <p className="text-lg text-center text-slate-300 max-w-sm">
          Manage coaches, students, courses, payments, and platform settings.
        </p>
      </div>
      <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center relative">
        <Link to="/login" className="absolute top-6 left-6 text-slate-400 hover:text-emerald-400 flex items-center gap-2 transition-colors">
          <ArrowLeft size={16} /> <span className="text-sm font-medium">Roles</span>
        </Link>
        <div className="text-center mb-8 mt-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-800 text-emerald-400 mb-4 md:hidden">
            <ShieldCheck size={24} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Control</h1>
          <p className="text-slate-400">Secure system access</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1" htmlFor="email">Admin Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Mail size={18} />
              </div>
              <input
                id="email" type="email" name="email" value={form.email} onChange={handleChange}
                className="pl-10 w-full rounded-lg border border-slate-600 bg-slate-800 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all placeholder-slate-500"
                placeholder="admin@example.com" autoComplete="email"
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-slate-300" htmlFor="password">Password</label>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Lock size={18} />
              </div>
              <input
                id="password" type={showPass ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange}
                className="pl-10 pr-10 w-full rounded-lg border border-slate-600 bg-slate-800 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all placeholder-slate-500"
                placeholder="••••••••" autoComplete="current-password"
              />
              <button
                type="button" onClick={() => setShowPass(!showPass)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-slate-900 bg-emerald-500 hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 focus:ring-offset-slate-900 transition-colors mt-4">
            {loading ? <span className="btn-spinner border-slate-900 mr-2" /> : null}
            {loading ? 'Authorizing...' : 'Sign In to Admin Panel'}
          </button>
        </form>
      </div>
    </div>
  )
}
export default AdminLogin
