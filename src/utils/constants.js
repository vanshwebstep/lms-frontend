export const ROLES = {
  SUPER_ADMIN: 'superadmin',
  COACH: 'coach',
  STUDENT: 'student',
}

export const COURSE_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
}

export const PLAN_TYPE = {
  FREE: 'free',
  ONE_TIME: 'one_time',
  SUBSCRIPTION: 'subscription',
}

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'failed',
  REFUNDED: 'refunded',
}

export const QUIZ_TYPE = {
  MCQ: 'mcq',
  TRUE_FALSE: 'true_false',
  SHORT_ANSWER: 'short_answer',
}

export const ASSIGNMENT_STATUS = {
  PENDING: 'pending',
  SUBMITTED: 'submitted',
  GRADED: 'graded',
}

export const USER_STATUS = {
  ACTIVE: 'active',
  BLOCKED: 'blocked',
  PENDING: 'pending',
}

export const CONTENT_TYPE = {
  VIDEO: 'video',
  DOCUMENT: 'document',
  LINK: 'link',
  TEXT: 'text',
}

export const LOCAL_KEYS = {
  TOKEN: 'lms_access_token',
  REFRESH: 'lms_refresh_token',
  USER: 'lms_user',
  MOCK_ACCOUNTS: 'lms_mock_accounts',
  RESET_TOKEN: 'lms_reset_token',
  THEME: 'lms_theme',
}

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  LIMITS: [10, 25, 50, 100],
}
