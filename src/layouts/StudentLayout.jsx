import {
  Award,
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  Settings,
  TrendingUp,
} from 'lucide-react'
import DashboardShell from './DashboardShell'

const navItems = [
  { path: '/student/dashboard', label: 'Overview', icon: LayoutDashboard },
  { path: '/student/courses', label: 'Browse Courses', icon: BookOpen },
  { path: '/student/my-learning', label: 'My Learning', icon: GraduationCap },
  { path: '/student/progress', label: 'Progress', icon: TrendingUp },
  { path: '/student/certificates', label: 'Certificates', icon: Award },
  { path: '/student/settings', label: 'Settings', icon: Settings },
]

export default function StudentLayout() {
  return (
    <DashboardShell
      navItems={navItems}
      label="Student Hub"
      title="Learning Dashboard"
      subtitle="Courses, progress, certificates, and study activity"
      accent="student"
      profilePath="/student/profile"
    />
  )
}
