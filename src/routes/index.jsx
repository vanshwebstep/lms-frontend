import { createBrowserRouter } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import { ROLES } from '../utils/constants'
import PlaceholderPage from '../components/common/PlaceholderPage'
import RootRedirect from './RootRedirect'

// Layouts
import AuthLayout from '../layouts/AuthLayout'
import AdminLayout from '../layouts/AdminLayout'
import CoachLayout from '../layouts/CoachLayout'
import StudentLayout from '../layouts/StudentLayout'

// Auth pages
import Login from '../pages/auth/Login'
import Register from '../pages/auth/Register'
import ForgotPassword from '../pages/auth/ForgotPassword'
import ResetPassword from '../pages/auth/ResetPassword'
import VerifyEmail from '../pages/auth/VerifyEmail'

// Super Admin pages
import AdminDashboard from '../pages/superadmin/AdminDashboard'
import AdminCourseDetail from '../pages/superadmin/CourseDetail'
import AdminProfile from '../pages/superadmin/AdminProfile'
import ManageCoaches from '../pages/superadmin/ManageCoaches'
import StudentSettings from '../pages/student/StudentSettings'
import StudentProfile from '../pages/student/StudentProfile'
import ManageCourses from '../pages/superadmin/ManageCourses'
import MyProgress from '../pages/student/MyProgress'
import ManageStudents from '../pages/superadmin/ManageStudents'
import Reports from '../pages/superadmin/Reports'
import Certificates from '../pages/student/Certificates'
import MyLearning from '../pages/student/MyLearning'
import PlatformSettings from '../pages/superadmin/PlatformSettings'
import ManagePayments from '../pages/superadmin/ManagePayments'
import ManageMasterData from '../pages/superadmin/ManageMasterData'

// Coach pages
import CoachDashboard from '../pages/coach/CoachDashboard'
import MyCourses from '../pages/coach/MyCourses'
import CreateCourse from '../pages/coach/CreateCourse'
import CoachCourseDetail from '../pages/coach/CourseDetail'
import ManageLessons from '../pages/coach/ManageLessons'
import CreateLesson from '../pages/coach/CreateLesson'
import ManageTopics from '../pages/coach/ManageTopics'
import ManageQuizzes from '../pages/coach/ManageQuizzes'
import CreateQuiz from '../pages/coach/CreateQuiz'
import ManageAssignments from '../pages/coach/ManageAssignments'
import UploadMaterials from '../pages/coach/UploadMaterials'
import PricingPlans from '../pages/coach/PricingPlans'
import MyStudents from '../pages/coach/MyStudents'
import StudentProgress from '../pages/coach/StudentProgress'
import CoachEarnings from '../pages/coach/CoachEarnings'
import CoachSettings from '../pages/coach/CoachSettings'

// Student pages
import StudentDashboard from '../pages/student/StudentDashboard'
import CourseCatalog from '../pages/student/CourseCatalog'
import StudentCourseDetail from '../pages/student/CourseDetail'
import Checkout from '../pages/student/Checkout'
import LearnCourse from '../pages/student/LearnCourse'
import SubmitAssignment from '../pages/student/SubmitAssignment'
import AttemptQuiz from '../pages/student/AttemptQuiz'

const placeholderDescription = 'Screen ready in navigation. Backend data can be connected here.'
const placeholder = (title) => (
  <PlaceholderPage title={title} description={placeholderDescription} />
)

const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <Login /> },
      { path: '/register', element: <Register /> },
      { path: '/forgot-password', element: <ForgotPassword /> },
      { path: '/reset-password/:token', element: <ResetPassword /> },
      { path: '/verify-email/:token', element: <VerifyEmail /> },
    ],
  },
  {
    element: <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]} />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: '/admin/dashboard', element: <AdminDashboard /> },
          { path: '/admin/coaches', element: <ManageCoaches /> },
          { path: '/admin/students', element: <ManageStudents /> },
          { path: '/admin/courses', element: <ManageCourses /> },
          { path: '/admin/courses/:id', element: <AdminCourseDetail /> },
          { path: '/admin/master-data', element: <ManageMasterData /> },
          { path: '/admin/payments', element: <ManagePayments /> },
          { path: '/admin/subscriptions', element: placeholder('Subscriptions') },
          { path: '/admin/reports', element: <Reports /> },
          { path: '/admin/settings', element: <PlatformSettings /> },
          { path: '/admin/profile', element: <AdminProfile /> },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute allowedRoles={[ROLES.COACH]} />,
    children: [
      {
        element: <CoachLayout />,
        children: [
          { path: '/coach/dashboard', element: <CoachDashboard /> },
          { path: '/coach/my-courses', element: <MyCourses /> },
          { path: '/coach/create-course', element: <CreateCourse /> },
          { path: '/coach/course-detail/:id', element: <CoachCourseDetail /> },
          { path: '/coach/edit-course/:id', element: <CreateCourse /> },
          { path: '/coach/manage-lessons', element: <ManageLessons /> },
          { path: '/coach/create-lesson', element: <CreateLesson /> },
          { path: '/coach/manage-topics', element: <ManageTopics /> },
          { path: '/coach/quizzes', element: <ManageQuizzes /> },
          { path: '/coach/create-quiz', element: <CreateQuiz /> },
          { path: '/coach/quizzes/:quizId/edit', element: <CreateQuiz /> },
          { path: '/coach/assignments', element: <ManageAssignments /> },
          { path: '/coach/upload-materials', element: <UploadMaterials /> },
          { path: '/coach/pricing-plans', element: <PricingPlans /> },
          { path: '/coach/my-students', element: <MyStudents /> },
          { path: '/coach/students/:id/progress', element: <StudentProgress /> },
          { path: '/coach/earnings', element: <CoachEarnings /> },
          { path: '/coach/settings', element: <CoachSettings /> },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute allowedRoles={[ROLES.STUDENT]} />,
    children: [
      {
        element: <StudentLayout />,
        children: [
          { path: '/student/dashboard', element: <StudentDashboard /> },
          { path: '/student/courses', element: <CourseCatalog /> },
          { path: '/student/courses/:id', element: <StudentCourseDetail /> },
          { path: '/student/my-learning', element: <MyLearning /> },
          { path: '/student/learn/:courseId', element: <LearnCourse /> },
          { path: '/student/assignments/:assignmentId/submit', element: <SubmitAssignment /> },
          { path: '/student/quizzes/:quizId/attempt', element: <AttemptQuiz /> },
          { path: '/student/progress', element: <MyProgress /> },
          { path: '/student/certificates', element: <Certificates /> },
          { path: '/student/profile', element: <StudentProfile /> },
          { path: '/student/settings', element: <StudentSettings /> },
          { path: '/student/checkout/:planId', element: <Checkout /> },
          { path: '/student/payment/success', element: placeholder('Payment Success') },
          { path: '/student/payment/failed', element: placeholder('Payment Failed') },
        ],
      },
    ],
  },
  { path: '/', element: <RootRedirect /> },
  { path: '*', element: <RootRedirect /> },
])

export default router
