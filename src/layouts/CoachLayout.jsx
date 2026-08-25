import {
  BookOpen,
  ClipboardList,
  DollarSign,
  LayoutDashboard,
  Settings,
  Users,
} from 'lucide-react'
import DashboardShell from './DashboardShell'

const navItems = [
  { path: '/coach/dashboard', label: 'Overview', icon: LayoutDashboard },
  { path: '/coach/my-courses', label: 'My Courses', icon: BookOpen },
  { path: '/coach/manage-lessons', label: 'Content Builder', icon: BookOpen },
  { path: '/coach/my-students', label: 'Students', icon: Users },
  { path: '/coach/assignments', label: 'Assignments', icon: ClipboardList },
  { path: '/coach/earnings', label: 'Earnings', icon: DollarSign },
  { path: '/coach/settings', label: 'Settings', icon: Settings },
]

export default function CoachLayout() {
  return (
    <DashboardShell
      navItems={navItems}
      label="Coach Studio"
      title="Creator Workspace"
      subtitle="Courses, students, content, and revenue in one view"
      accent="coach"
      profilePath="/coach/settings"
    />
  )
}
