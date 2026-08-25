import {
  BarChart3,
  BookOpen,
  CreditCard,
  LayoutDashboard,
  Settings,
  Tags,
  Users,
} from 'lucide-react'
import DashboardShell from './DashboardShell'

const navItems = [
  { path: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
  { path: '/admin/coaches', label: 'Coaches', icon: Users },
  { path: '/admin/students', label: 'Students', icon: Users },
  { path: '/admin/courses', label: 'Courses', icon: BookOpen },
  { path: '/admin/master-data', label: 'Master Data', icon: Tags },
  { path: '/admin/payments', label: 'Payments', icon: CreditCard },
  { path: '/admin/reports', label: 'Reports', icon: BarChart3 },
  { path: '/admin/settings', label: 'Settings', icon: Settings },
]

export default function AdminLayout() {
  return (
    <DashboardShell
      navItems={navItems}
      label="Super Admin"
      title="Control Center"
      subtitle="Platform health, user activity, and revenue monitoring"
      accent="admin"
      profilePath="/admin/profile"
    />
  )
}
