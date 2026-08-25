export const THEME = {
  colors: {
    primary: '#4F46E5',       // Indigo
    primaryDark: '#3730A3',
    primaryLight: '#818CF8',
    secondary: '#0EA5E9',     // Sky blue
    accent: '#F59E0B',        // Amber
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    dark: '#0F172A',
    darkCard: '#1E293B',
    darkBorder: '#334155',
    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
  },
  fonts: {
    heading: "'Syne', sans-serif",
    body: "'DM Sans', sans-serif",
    mono: "'JetBrains Mono', monospace",
  },
  borderRadius: {
    sm: '6px',
    md: '10px',
    lg: '16px',
    xl: '24px',
    full: '9999px',
  },
  shadows: {
    card: '0 4px 24px rgba(0,0,0,0.25)',
    glow: '0 0 24px rgba(79,70,229,0.35)',
    glowAccent: '0 0 24px rgba(245,158,11,0.3)',
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
}

export const ROLES = {
  SUPER_ADMIN: 'superadmin',
  COACH: 'coach',
  STUDENT: 'student',
}

export default THEME