import { Link } from 'react-router-dom'
import { GraduationCap, ShieldCheck, UserCog } from 'lucide-react'

const ROLE_OPTIONS = [
  {
    path: '/login/student',
    label: 'Student',
    title: 'Student Portal',
    subtitle: 'Access enrolled courses, lessons, quizzes, and assignments.',
    Icon: GraduationCap,
    bgColor: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
    iconBg: 'bg-indigo-100',
    hoverBorder: 'hover:border-indigo-300 hover:shadow-indigo-100'
  },
  {
    path: '/login/coach',
    label: 'Coach',
    title: 'Coach Studio',
    subtitle: 'Create courses, manage learning content, students, and revenue.',
    Icon: UserCog,
    bgColor: 'bg-amber-50',
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-100',
    hoverBorder: 'hover:border-amber-300 hover:shadow-amber-100'
  },
  {
    path: '/login/admin',
    label: 'Admin',
    title: 'Admin Panel',
    subtitle: 'Manage platform, coaches, students, payments, and settings.',
    Icon: ShieldCheck,
    bgColor: 'bg-slate-50',
    iconColor: 'text-slate-700',
    iconBg: 'bg-slate-200',
    hoverBorder: 'hover:border-slate-300 hover:shadow-slate-100'
  },
]

const Login = () => {
  return (
    <div className="w-full max-w-4xl mx-auto py-8 animate-slideUp">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">Welcome to LearnFlow</h1>
        <p className="text-lg text-gray-500 max-w-xl mx-auto">
          Please select your role to continue to your customized dashboard.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {ROLE_OPTIONS.map(({ path, label, title, subtitle, Icon, bgColor, iconColor, iconBg, hoverBorder }) => (
          <Link
            key={path}
            to={path}
            className={`flex flex-col items-center text-center p-8 rounded-2xl border-2 border-transparent bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${hoverBorder}`}
          >
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${iconBg} ${iconColor}`}>
              <Icon size={40} />
            </div>
            <span className={`text-sm font-semibold uppercase tracking-wider mb-2 ${iconColor}`}>
              {label}
            </span>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">{title}</h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              {subtitle}
            </p>
          </Link>
        ))}
      </div>
      
      <div className="mt-12 text-center text-gray-500 text-sm">
        <p>Don't have an account yet? <Link to="/register" className="text-indigo-600 font-medium hover:underline">Register as a Student</Link></p>
      </div>
    </div>
  )
}

export default Login