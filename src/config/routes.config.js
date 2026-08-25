export const ROUTES = {
  // Public
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password/:token',
  VERIFY_EMAIL: '/verify-email/:token',

  // Super Admin
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    COACHES: '/admin/coaches',
    COACH_DETAIL: '/admin/coaches/:id',
    STUDENTS: '/admin/students',
    STUDENT_DETAIL: '/admin/students/:id',
    COURSES: '/admin/courses',
    COURSE_DETAIL: '/admin/courses/:id',
    PAYMENTS: '/admin/payments',
    SUBSCRIPTIONS: '/admin/subscriptions',
    REPORTS: '/admin/reports',
    SETTINGS: '/admin/settings',
    PROFILE: '/admin/profile',
  },

  // Coach
  COACH: {
    DASHBOARD: '/coach/dashboard',
    MY_COURSES: '/coach/courses',
    CREATE_COURSE: '/coach/courses/create',
    EDIT_COURSE: '/coach/courses/:id/edit',
    COURSE_DETAIL: '/coach/courses/:id',
    MANAGE_LESSONS: '/coach/courses/:id/lessons',
    CREATE_LESSON: '/coach/courses/:id/lessons/create',
    MANAGE_TOPICS: '/coach/courses/:courseId/lessons/:lessonId/topics',
    MANAGE_QUIZZES: '/coach/courses/:id/quizzes',
    CREATE_QUIZ: '/coach/courses/:id/quizzes/create',
    MANAGE_ASSIGNMENTS: '/coach/courses/:id/assignments',
    CREATE_ASSIGNMENT: '/coach/courses/:id/assignments/create',
    UPLOAD_MATERIALS: '/coach/courses/:id/materials',
    PRICING_PLANS: '/coach/courses/:id/pricing',
    CREATE_PLAN: '/coach/courses/:id/pricing/create',
    MY_STUDENTS: '/coach/students',
    STUDENT_PROGRESS: '/coach/students/:id/progress',
    EARNINGS: '/coach/earnings',
    PROFILE: '/coach/profile',
    SETTINGS: '/coach/settings',
  },

  // Student
  STUDENT: {
    DASHBOARD: '/student/dashboard',
    BROWSE_COURSES: '/student/courses',
    COURSE_DETAIL: '/student/courses/:id',
    COACH_PROFILE: '/student/coach/:id',
    MY_LEARNING: '/student/my-learning',
    LEARN_COURSE: '/student/learn/:courseId',
    WATCH_LESSON: '/student/learn/:courseId/lesson/:lessonId',
    ATTEMPT_QUIZ: '/student/learn/:courseId/quiz/:quizId',
    SUBMIT_ASSIGNMENT: '/student/learn/:courseId/assignment/:assignmentId',
    MY_PROGRESS: '/student/progress',
    CERTIFICATES: '/student/certificates',
    CHECKOUT: '/student/checkout/:planId',
    PAYMENT_SUCCESS: '/student/payment/success',
    PAYMENT_FAILED: '/student/payment/failed',
    PROFILE: '/student/profile',
    SETTINGS: '/student/settings',
  },
}

export default ROUTES