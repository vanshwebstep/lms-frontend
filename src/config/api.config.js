const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  TIMEOUT: 15000,
  ENDPOINTS: {
    // Auth
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      LOGOUT: '/auth/logout',
      FORGOT_PASSWORD: '/auth/forgot-password',
      RESET_PASSWORD: '/auth/reset-password',
      VERIFY_EMAIL: '/auth/verify-email',
      ME: '/auth/me',
      REFRESH_TOKEN: '/auth/refresh-token',
    },
    // Super Admin
    ADMIN: {
      DASHBOARD_STATS: '/admin/stats',
      COACHES: '/admin/coaches',
      STUDENTS: '/admin/students',
      COURSES: '/admin/courses',
      PAYMENTS: '/admin/payments',
      SUBSCRIPTIONS: '/admin/subscriptions',
      BLOCK_USER: '/admin/users/block',
      UNBLOCK_USER: '/admin/users/unblock',
      REPORTS: '/admin/reports',
      SETTINGS: '/admin/settings',
    },
    // Coach
    COACH: {
      DASHBOARD_STATS: '/coach/stats',
      PROFILE: '/coach/profile',
      COURSES: '/coach/courses',
      LESSONS: '/coach/lessons',
      TOPICS: '/coach/topics',
      QUIZZES: '/coach/quizzes',
      ASSIGNMENTS: '/coach/assignments',
      MATERIALS: '/coach/materials',
      PRICING_PLANS: '/coach/pricing-plans',
      STUDENTS: '/coach/students',
      EARNINGS: '/coach/earnings',
    },
    // Student
    STUDENT: {
      DASHBOARD_STATS: '/student/stats',
      PROFILE: '/student/profile',
      BROWSE_COURSES: '/student/courses/browse',
      MY_COURSES: '/student/courses/enrolled',
      ENROLL: '/student/enroll',
      PROGRESS: '/student/progress',
      QUIZZES: '/student/quizzes',
      ASSIGNMENTS: '/student/assignments',
      CERTIFICATES: '/student/certificates',
    },
    // Payments
    PAYMENTS: {
      CREATE_ORDER: '/payments/create-order',
      VERIFY: '/payments/verify',
      HISTORY: '/payments/history',
    },
    // Upload
    UPLOAD: {
      IMAGE: '/upload/image',
      VIDEO: '/upload/video',
      DOCUMENT: '/upload/document',
    },
  },
}

export default API_CONFIG