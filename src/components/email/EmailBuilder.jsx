import { useState, useEffect, useMemo, useRef } from 'react'
import {
  GripVertical,
  Plus,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Eye,
  Code,
  Smartphone,
  Monitor,
  Send,
  Sparkles,
  Save,
  Check,
  Type,
  Layout,
  MousePointerClick,
  Info,
  List,
  Minus,
  Image as ImageIcon,
  UploadCloud,
  Columns,
  Palette,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ExternalLink,
  Shield,
  Layers,
  Sliders,
  Move,
  RotateCcw,
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api'

// Default sample variables for live preview
const DEFAULT_PREVIEW_VARS = {
  name: 'Rohan Sharma',
  studentName: 'Rohan Sharma',
  studentEmail: 'student@learnflow.local',
  coachName: 'Dr. Meera Patel',
  courseName: 'Complete React & Node.js Masterclass 2026',
  assignmentTitle: 'Responsive Full-Stack Portfolio',
  quizTitle: 'Advanced State Management Quiz',
  score: '95',
  maxScore: '100',
  feedback: 'Excellent component architecture and clean state management!',
  certificateNo: 'LF-CERT-984210',
  amount: '1,499.00',
  currency: 'INR',
  password: 'Password@2026!',
  otp: '748291',
  resetToken: 'rst_sample_token_748291',
  appName: 'LearnFlow',
  loginUrl: 'http://localhost:5173/login',
}

const TOOLBOX_ITEMS = [
  { type: 'header', label: 'Header / Logo', icon: Layout, category: 'Header', desc: 'Top brand banner or logo' },
  { type: 'heading', label: 'Heading', icon: Type, category: 'Typography', desc: 'H1, H2, H3 titles' },
  { type: 'paragraph', label: 'Text Paragraph', icon: Type, category: 'Typography', desc: 'Rich body text copy' },
  { type: 'button', label: 'Call to Action', icon: MousePointerClick, category: 'Elements', desc: 'Clickable button' },
  { type: 'image', label: 'Image / Upload', icon: ImageIcon, category: 'Media', desc: 'Upload or link image' },
  { type: 'two_columns', label: '2-Columns Grid', icon: Columns, category: 'Layout', desc: 'Side-by-side dual columns' },
  { type: 'highlight_box', label: 'Credentials Box', icon: Info, category: 'Elements', desc: 'Highlight box for passwords/OTPs' },
  { type: 'key_value', label: 'Order Summary', icon: List, category: 'Elements', desc: 'Key-value rows table' },
  { type: 'divider', label: 'Divider / Spacer', icon: Minus, category: 'Layout', desc: 'Separation line or gap' },
  { type: 'footer', label: 'Footer & Social', icon: Layout, category: 'Footer', desc: 'Copyright & disclaimer' },
]

const createBlock = (type) => {
  const id = `blk_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
  switch (type) {
    case 'header':
      return {
        id,
        type,
        title: 'Welcome to {{appName}}',
        subtitle: 'Your Global Learning Platform',
        logoUrl: '',
        bgColor: '#4f46e5',
        textColor: '#ffffff',
        icon: '🚀',
        padding: 32,
      }
    case 'heading':
      return {
        id,
        type,
        text: 'Important Update For You',
        level: 'h2',
        align: 'left',
        color: '#0f172a',
        fontFamily: 'sans-serif',
        fontSize: 22,
      }
    case 'paragraph':
      return {
        id,
        type,
        text: 'Hello {{name}},\n\nThank you for choosing {{appName}}. We are thrilled to have you with us on this learning journey.',
        align: 'left',
        color: '#334155',
        fontSize: 15,
        lineHeight: 1.65,
      }
    case 'button':
      return {
        id,
        type,
        text: 'Go to Your Dashboard',
        url: '{{loginUrl}}',
        bgColor: '#4f46e5',
        textColor: '#ffffff',
        align: 'center',
        borderRadius: 8,
        fullWidth: false,
        size: 'medium',
      }
    case 'image':
      return {
        id,
        type,
        url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60',
        alt: 'Course Media',
        link: '{{loginUrl}}',
        width: 100, // percentage
        borderRadius: 8,
        align: 'center',
      }
    case 'two_columns':
      return {
        id,
        type,
        col1Title: 'Course Overview',
        col1Text: 'Access all video lectures, interactive quizzes, and downloadable resources.',
        col2Title: 'Live Support',
        col2Text: 'Ask questions in discussion forums and get certified upon completion.',
        bgColor: '#f8fafc',
        borderColor: '#e2e8f0',
      }
    case 'highlight_box':
      return {
        id,
        type,
        title: 'Your Account Credentials',
        body: 'Email: {{email}}\nTemporary Password: {{password}}',
        bgColor: '#f8fafc',
        borderColor: '#6366f1',
        textColor: '#1e293b',
      }
    case 'key_value':
      return {
        id,
        type,
        title: 'Transaction Details',
        items: [
          { key: 'Course', value: '{{courseName}}' },
          { key: 'Instructor', value: '{{coachName}}' },
          { key: 'Amount Paid', value: '{{currency}} {{amount}}' },
        ],
        bgColor: '#f8fafc',
      }
    case 'divider':
      return { id, type, color: '#e2e8f0', thickness: 1, spacing: 20 }
    case 'footer':
      return {
        id,
        type,
        text: '© {{appName}}. All rights reserved.\nYou received this email because of your account activity on our platform.',
        bgColor: '#f8fafc',
        color: '#94a3b8',
        fontSize: 12,
      }
    default:
      return { id, type, text: '' }
  }
}

// Convert blocks array to clean responsive HTML email
export const generateHtmlFromBlocks = (blocks, emailSettings = {}) => {
  const {
    bodyBg = '#f1f5f9',
    containerBg = '#ffffff',
    containerWidth = 600,
    fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  } = emailSettings

  const contentHtml = blocks
    .map((block) => {
      switch (block.type) {
        case 'header':
          return `
            <div style="background-color:${block.bgColor || '#4f46e5'};padding:${block.padding || 32}px 20px;text-align:center;color:${block.textColor || '#ffffff'};">
              ${block.logoUrl ? `<img src="${block.logoUrl}" alt="Logo" style="max-height:48px;margin-bottom:12px;" />` : ''}
              <h1 style="margin:0;font-size:24px;font-weight:700;letter-spacing:-0.5px;">${block.icon ? block.icon + ' ' : ''}${block.title || ''}</h1>
              ${block.subtitle ? `<p style="margin:6px 0 0 0;font-size:14px;opacity:0.9;">${block.subtitle}</p>` : ''}
            </div>`
        case 'heading': {
          const fontSize = block.fontSize ? `${block.fontSize}px` : block.level === 'h1' ? '24px' : '20px'
          return `
            <div style="padding:12px 28px;text-align:${block.align || 'left'};">
              <h2 style="margin:0;font-size:${fontSize};color:${block.color || '#0f172a'};font-weight:700;">${block.text || ''}</h2>
            </div>`
        }
        case 'paragraph': {
          const formatted = (block.text || '')
            .split('\n')
            .filter((p) => p.trim())
            .map(
              (p) =>
                `<p style="margin:0 0 14px 0;line-height:${block.lineHeight || 1.65};font-size:${
                  block.fontSize || 15
                }px;color:${block.color || '#334155'};">${p}</p>`
            )
            .join('')
          return `<div style="padding:10px 28px;text-align:${block.align || 'left'};">${formatted}</div>`
        }
        case 'button': {
          const padY = block.size === 'large' ? 16 : block.size === 'small' ? 9 : 13
          const padX = block.size === 'large' ? 38 : block.size === 'small' ? 20 : 32
          const btnWidth = block.fullWidth ? 'width:100%;box-sizing:border-box;text-align:center;' : ''
          return `
            <div style="padding:16px 28px;text-align:${block.align || 'center'};">
              <a href="${block.url || '#'}" style="display:${block.fullWidth ? 'block' : 'inline-block'};${btnWidth}padding:${padY}px ${padX}px;background-color:${
            block.bgColor || '#4f46e5'
          };color:${block.textColor || '#ffffff'};text-decoration:none;border-radius:${
            block.borderRadius !== undefined ? block.borderRadius : 8
          }px;font-weight:700;font-size:15px;box-shadow:0 2px 4px rgba(0,0,0,0.1);">${block.text || 'Click Here'}</a>
            </div>`
        }
        case 'image':
          return `
            <div style="padding:14px 28px;text-align:${block.align || 'center'};">
              <a href="${block.link || '#'}" target="_blank" style="text-decoration:none;">
                <img src="${block.url || ''}" alt="${block.alt || ''}" style="width:${block.width || 100}%;max-width:100%;height:auto;border-radius:${
            block.borderRadius || 8
          }px;display:block;margin:0 auto;" />
              </a>
            </div>`
        case 'two_columns':
          return `
            <div style="padding:14px 28px;">
              <table style="width:100%;border-collapse:collapse;" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="width:48%;vertical-align:top;background-color:${block.bgColor || '#f8fafc'};border:1px solid ${
            block.borderColor || '#e2e8f0'
          };border-radius:8px;padding:16px;">
                    <h4 style="margin:0 0 8px 0;font-size:15px;color:#0f172a;">${block.col1Title || ''}</h4>
                    <p style="margin:0;font-size:13px;color:#475569;line-height:1.5;">${block.col1Text || ''}</p>
                  </td>
                  <td style="width:4%;"></td>
                  <td style="width:48%;vertical-align:top;background-color:${block.bgColor || '#f8fafc'};border:1px solid ${
            block.borderColor || '#e2e8f0'
          };border-radius:8px;padding:16px;">
                    <h4 style="margin:0 0 8px 0;font-size:15px;color:#0f172a;">${block.col2Title || ''}</h4>
                    <p style="margin:0;font-size:13px;color:#475569;line-height:1.5;">${block.col2Text || ''}</p>
                  </td>
                </tr>
              </table>
            </div>`
        case 'highlight_box': {
          const bodyLines = (block.body || '')
            .split('\n')
            .map((l) => `<div style="margin-bottom:6px;font-size:14px;color:${block.textColor || '#334155'};">${l}</div>`)
            .join('')
          return `
            <div style="padding:12px 28px;">
              <div style="background-color:${block.bgColor || '#f8fafc'};border-left:4px solid ${
            block.borderColor || '#6366f1'
          };padding:16px 20px;border-radius:0 8px 8px 0;">
                ${block.title ? `<h4 style="margin:0 0 10px 0;font-size:16px;color:#0f172a;">${block.title}</h4>` : ''}
                ${bodyLines}
              </div>
            </div>`
        }
        case 'key_value': {
          const rows = (block.items || [])
            .map(
              (item) => `
              <tr style="border-bottom:1px solid #e2e8f0;">
                <td style="padding:8px 0;font-weight:600;color:#64748b;font-size:14px;">${item.key}</td>
                <td style="padding:8px 0;text-align:right;font-weight:700;color:#0f172a;font-size:14px;">${item.value}</td>
              </tr>`
            )
            .join('')
          return `
            <div style="padding:12px 28px;">
              <div style="background-color:${block.bgColor || '#f8fafc'};border:1px solid #e2e8f0;border-radius:8px;padding:16px 20px;">
                ${block.title ? `<h4 style="margin:0 0 12px 0;font-size:15px;color:#0f172a;">${block.title}</h4>` : ''}
                <table style="width:100%;border-collapse:collapse;">
                  ${rows}
                </table>
              </div>
            </div>`
        }
        case 'divider':
          return `
            <div style="padding:${block.spacing || 16}px 28px;">
              <hr style="border:0;border-top:${block.thickness || 1}px solid ${block.color || '#e2e8f0'};margin:0;" />
            </div>`
        case 'footer':
          return `
            <div style="background-color:${block.bgColor || '#f8fafc'};padding:24px 20px;text-align:center;border-top:1px solid #e2e8f0;margin-top:20px;">
              <p style="margin:0;font-size:${block.fontSize || 12}px;color:${block.color || '#94a3b8'};line-height:1.5;">${(
            block.text || ''
          ).replace(/\n/g, '<br>')}</p>
            </div>`
        default:
          return ''
      }
    })
    .join('\n')

  const metaComment = `<!-- BLOCKS_METADATA:${encodeURIComponent(
    JSON.stringify({ blocks, emailSettings })
  )} -->`

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email</title>
  <style>
    body { margin: 0; padding: 0; background-color: ${bodyBg}; font-family: ${fontFamily}; }
    .email-container { max-width: ${containerWidth}px; margin: 24px auto; background-color: ${containerBg}; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.06); }
    @media only screen and (max-width: 640px) {
      .email-container { margin: 0 auto; border-radius: 0; width: 100% !important; }
    }
  </style>
</head>
<body>
  <div class="email-container">
    ${contentHtml}
  </div>
  ${metaComment}
</body>
</html>`
}

export const parseBlocksFromHtml = (html, action = '', subject = '') => {
  if (html && typeof html === 'string') {
    const match = html.match(/<!-- BLOCKS_METADATA:([^\s]+) -->/)
    if (match && match[1]) {
      try {
        const decoded = decodeURIComponent(match[1])
        const parsed = JSON.parse(decoded)
        if (parsed?.blocks && Array.isArray(parsed.blocks) && parsed.blocks.length > 0) {
          return {
            blocks: parsed.blocks,
            emailSettings: parsed.emailSettings || {
              bodyBg: '#f1f5f9',
              containerBg: '#ffffff',
              containerWidth: 600,
              fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
            },
          }
        }
      } catch (err) {
        console.warn('Could not parse blocks metadata:', err)
      }
    }
  }

  return {
    blocks: getPresetBlocksForAction(action, subject),
    emailSettings: {
      bodyBg: '#f1f5f9',
      containerBg: '#ffffff',
      containerWidth: 600,
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    },
  }
}

const getPresetBlocksForAction = (action = '', subject = '') => {
  const act = (action || '').toLowerCase()
  if (act === 'coach-created' || act.includes('coach')) {
    return [
      {
        id: 'blk_header',
        type: 'header',
        title: 'Welcome to {{appName}} Coach Studio',
        subtitle: 'Your Instructor Account Credentials',
        bgColor: '#0f172a',
        textColor: '#ffffff',
        icon: '🎓',
        padding: 32,
      },
      {
        id: 'blk_heading',
        type: 'heading',
        text: 'Welcome {{name}},',
        level: 'h2',
        align: 'left',
        color: '#0f172a',
        fontSize: 22,
      },
      {
        id: 'blk_p1',
        type: 'paragraph',
        text: 'An instructor account has been created for you on {{appName}}. Here are your login credentials to access the instructor studio:',
        align: 'left',
        color: '#334155',
        fontSize: 15,
      },
      {
        id: 'blk_creds',
        type: 'highlight_box',
        title: 'Your Login Credentials',
        body: 'Email: {{email}}\nTemporary Password: {{password}}',
        bgColor: '#f8fafc',
        borderColor: '#4f46e5',
        textColor: '#0f172a',
      },
      {
        id: 'blk_p2',
        type: 'paragraph',
        text: 'Please log in and update your password from your account settings upon your first visit.',
        align: 'left',
        color: '#64748b',
        fontSize: 14,
      },
      {
        id: 'blk_btn',
        type: 'button',
        text: 'Log In to Coach Studio',
        url: '{{loginUrl}}',
        bgColor: '#4f46e5',
        textColor: '#ffffff',
        align: 'center',
        borderRadius: 8,
      },
      {
        id: 'blk_footer',
        type: 'footer',
        text: '© {{appName}}. All rights reserved.\nLearnFlow Administration Team',
        bgColor: '#f8fafc',
        color: '#94a3b8',
      },
    ]
  }

  if (act === 'course-purchased' || act.includes('purchase')) {
    return [
      {
        id: 'blk_header',
        type: 'header',
        title: 'Payment Successful! 🎉',
        subtitle: 'Your enrollment has been confirmed',
        bgColor: '#10b981',
        textColor: '#ffffff',
        icon: '✅',
        padding: 32,
      },
      {
        id: 'blk_heading',
        type: 'heading',
        text: 'Hi {{name}},',
        level: 'h2',
        align: 'left',
        color: '#0f172a',
        fontSize: 22,
      },
      {
        id: 'blk_p1',
        type: 'paragraph',
        text: 'You are officially enrolled in {{courseName}}. Your transaction has been completed successfully.',
        align: 'left',
        color: '#334155',
      },
      {
        id: 'blk_summary',
        type: 'key_value',
        title: 'Purchase Summary',
        items: [
          { key: 'Course', value: '{{courseName}}' },
          { key: 'Instructor', value: '{{coachName}}' },
          { key: 'Amount Paid', value: '{{currency}} {{amount}}' },
          { key: 'Access', value: 'Lifetime Access' },
        ],
        bgColor: '#f8fafc',
      },
      {
        id: 'blk_btn',
        type: 'button',
        text: 'Start Learning Now',
        url: '{{loginUrl}}',
        bgColor: '#10b981',
        textColor: '#ffffff',
        align: 'center',
        borderRadius: 8,
      },
      {
        id: 'blk_footer',
        type: 'footer',
        text: '© {{appName}}. All rights reserved.',
        bgColor: '#f8fafc',
        color: '#94a3b8',
      },
    ]
  }

  if (act === 'forgot-password' || act.includes('password')) {
    return [
      {
        id: 'blk_header',
        type: 'header',
        title: 'Password Reset Request 🔒',
        subtitle: 'One-Time Verification Code',
        bgColor: '#ef4444',
        textColor: '#ffffff',
        icon: '🔑',
        padding: 32,
      },
      {
        id: 'blk_heading',
        type: 'heading',
        text: 'Hello {{name}},',
        level: 'h2',
        align: 'left',
        color: '#0f172a',
        fontSize: 22,
      },
      {
        id: 'blk_p1',
        type: 'paragraph',
        text: 'We received a request to reset your password for your {{appName}} account. Use the one-time verification code below:',
        align: 'left',
        color: '#334155',
      },
      {
        id: 'blk_otp',
        type: 'highlight_box',
        title: 'Your Verification Code',
        body: 'Verification Code: {{otp}}\n(Valid for 10 minutes)',
        bgColor: '#fef2f2',
        borderColor: '#ef4444',
        textColor: '#991b1b',
      },
      {
        id: 'blk_footer',
        type: 'footer',
        text: 'If you did not request this, you can safely ignore this email.\n© {{appName}}. All rights reserved.',
        bgColor: '#f8fafc',
        color: '#94a3b8',
      },
    ]
  }

  if (act === 'assignment-graded') {
    return [
      {
        id: 'blk_header',
        type: 'header',
        title: 'Assignment Graded 📝',
        subtitle: 'Your instructor has reviewed your work',
        bgColor: '#6366f1',
        textColor: '#ffffff',
        icon: '📋',
        padding: 32,
      },
      {
        id: 'blk_heading',
        type: 'heading',
        text: 'Hello {{name}},',
        level: 'h2',
        align: 'left',
        color: '#0f172a',
        fontSize: 22,
      },
      {
        id: 'blk_p1',
        type: 'paragraph',
        text: 'Your submission for {{assignmentTitle}} in {{courseName}} has been graded.',
        align: 'left',
        color: '#334155',
      },
      {
        id: 'blk_score',
        type: 'highlight_box',
        title: 'Score: {{score}} / {{maxScore}}',
        body: 'Feedback: {{feedback}}',
        bgColor: '#eef2ff',
        borderColor: '#6366f1',
        textColor: '#312e81',
      },
      {
        id: 'blk_btn',
        type: 'button',
        text: 'View Submission & Grade',
        url: '{{loginUrl}}',
        bgColor: '#6366f1',
        textColor: '#ffffff',
        align: 'center',
        borderRadius: 8,
      },
      {
        id: 'blk_footer',
        type: 'footer',
        text: '© {{appName}}. All rights reserved.',
        bgColor: '#f8fafc',
        color: '#94a3b8',
      },
    ]
  }

  if (act === 'certificate-issued') {
    return [
      {
        id: 'blk_header',
        type: 'header',
        title: 'Course Completed! 🎓',
        subtitle: 'Verified Certificate of Completion Ready',
        bgColor: '#f59e0b',
        textColor: '#ffffff',
        icon: '🏆',
        padding: 32,
      },
      {
        id: 'blk_heading',
        type: 'heading',
        text: 'Congratulations {{name}}!',
        level: 'h2',
        align: 'left',
        color: '#0f172a',
        fontSize: 22,
      },
      {
        id: 'blk_p1',
        type: 'paragraph',
        text: 'You have successfully completed 100% of the curriculum for {{courseName}}.',
        align: 'left',
        color: '#334155',
      },
      {
        id: 'blk_cert',
        type: 'highlight_box',
        title: 'Verified Digital Certificate',
        body: 'Certificate No: {{certificateNo}}\nIssued by: {{appName}}',
        bgColor: '#fffbeb',
        borderColor: '#f59e0b',
        textColor: '#78350f',
      },
      {
        id: 'blk_btn',
        type: 'button',
        text: 'Download Your Certificate',
        url: '{{loginUrl}}',
        bgColor: '#f59e0b',
        textColor: '#ffffff',
        align: 'center',
        borderRadius: 8,
      },
      {
        id: 'blk_footer',
        type: 'footer',
        text: '© {{appName}}. All rights reserved.',
        bgColor: '#f8fafc',
        color: '#94a3b8',
      },
    ]
  }

  if (act === 'assignment-submitted') {
    return [
      {
        id: 'blk_header',
        type: 'header',
        title: 'Assignment Submitted 📤',
        subtitle: 'New student submission received',
        bgColor: '#8b5cf6',
        textColor: '#ffffff',
        icon: '📚',
        padding: 32,
      },
      {
        id: 'blk_heading',
        type: 'heading',
        text: 'Hello Coach {{name}},',
        level: 'h2',
        align: 'left',
        color: '#0f172a',
        fontSize: 22,
      },
      {
        id: 'blk_p1',
        type: 'paragraph',
        text: 'Student {{studentName}} has submitted their work for {{assignmentTitle}} in {{courseName}}.',
        align: 'left',
        color: '#334155',
        fontSize: 15,
      },
      {
        id: 'blk_submission_details',
        type: 'key_value',
        title: 'Submission Overview',
        items: [
          { key: 'Student Name', value: '{{studentName}}' },
          { key: 'Course', value: '{{courseName}}' },
          { key: 'Assignment', value: '{{assignmentTitle}}' },
          { key: 'Status', value: 'Pending Review' },
        ],
        bgColor: '#f5f3ff',
      },
      {
        id: 'blk_p2',
        type: 'paragraph',
        text: 'You can review their uploaded work, assign grades, and provide feedback in your Coach Studio.',
        align: 'left',
        color: '#64748b',
        fontSize: 14,
      },
      {
        id: 'blk_btn',
        type: 'button',
        text: 'Review & Grade Submission',
        url: '{{loginUrl}}',
        bgColor: '#8b5cf6',
        textColor: '#ffffff',
        align: 'center',
        borderRadius: 8,
      },
      {
        id: 'blk_footer',
        type: 'footer',
        text: '© {{appName}}. All rights reserved.\nCoach Notification System',
        bgColor: '#f8fafc',
        color: '#94a3b8',
      },
    ]
  }

  if (act === 'course-enrolled') {
    return [
      {
        id: 'blk_header',
        type: 'header',
        title: 'New Student Enrollment! 🎓',
        subtitle: 'A new student joined your course',
        bgColor: '#0284c7',
        textColor: '#ffffff',
        icon: '🚀',
        padding: 32,
      },
      {
        id: 'blk_heading',
        type: 'heading',
        text: 'Hello {{coachName}},',
        level: 'h2',
        align: 'left',
        color: '#0f172a',
        fontSize: 22,
      },
      {
        id: 'blk_p1',
        type: 'paragraph',
        text: 'Great news! {{studentName}} ({{studentEmail}}) has just enrolled in your course {{courseName}}.',
        align: 'left',
        color: '#334155',
      },
      {
        id: 'blk_btn',
        type: 'button',
        text: 'View Enrolled Students',
        url: '{{loginUrl}}',
        bgColor: '#0284c7',
        textColor: '#ffffff',
        align: 'center',
        borderRadius: 8,
      },
      {
        id: 'blk_footer',
        type: 'footer',
        text: '© {{appName}}. All rights reserved.',
        bgColor: '#f8fafc',
        color: '#94a3b8',
      },
    ]
  }

  if (act === 'student-registered') {
    return [
      {
        id: 'blk_header',
        type: 'header',
        title: 'Welcome to {{appName}}! 🚀',
        subtitle: 'Your Account is Ready',
        bgColor: '#4f46e5',
        textColor: '#ffffff',
        icon: '🌟',
        padding: 32,
      },
      {
        id: 'blk_heading',
        type: 'heading',
        text: 'Hello {{name}},',
        level: 'h2',
        align: 'left',
        color: '#0f172a',
        fontSize: 22,
      },
      {
        id: 'blk_p1',
        type: 'paragraph',
        text: 'Your account has been created successfully. You can now login using your registered email: {{email}}.',
        align: 'left',
        color: '#334155',
      },
      {
        id: 'blk_btn',
        type: 'button',
        text: 'Go to Your Dashboard',
        url: '{{loginUrl}}',
        bgColor: '#4f46e5',
        textColor: '#ffffff',
        align: 'center',
        borderRadius: 8,
      },
      {
        id: 'blk_footer',
        type: 'footer',
        text: '© {{appName}}. All rights reserved.',
        bgColor: '#f8fafc',
        color: '#94a3b8',
      },
    ]
  }

  // Default clean layout
  return [
    createBlock('header'),
    createBlock('heading'),
    createBlock('paragraph'),
    createBlock('button'),
    createBlock('footer'),
  ]
}

export default function EmailBuilder({
  action = '',
  initialSubject = '',
  initialHtml = '',
  initialVariables = [],
  onSave,
  onTestSend,
  isSaving = false,
  title = 'Email Template Customizer',
}) {
  // Parse initial blocks and canvas settings from saved HTML or action preset
  const [subject, setSubject] = useState(initialSubject)
  const [viewMode, setViewMode] = useState('visual') // 'visual' | 'code' | 'preview'
  const [previewDevice, setPreviewDevice] = useState('desktop') // 'desktop' | 'mobile'
  const [activeBlockId, setActiveBlockId] = useState(null)
  const [testEmailModal, setTestEmailModal] = useState(false)
  const [testEmailAddress, setTestEmailAddress] = useState('')
  const [isSendingTest, setIsSendingTest] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  const initialParsed = useMemo(
    () => parseBlocksFromHtml(initialHtml, action, initialSubject),
    [initialHtml, action, initialSubject]
  )

  const [emailSettings, setEmailSettings] = useState(initialParsed.emailSettings)
  const [blocks, setBlocks] = useState(initialParsed.blocks)
  const [rawHtml, setRawHtml] = useState(initialHtml || '')

  useEffect(() => {
    if (initialSubject) setSubject(initialSubject)
    if (initialHtml) setRawHtml(initialHtml)
    const parsed = parseBlocksFromHtml(initialHtml, action, initialSubject)
    setBlocks(parsed.blocks)
    setEmailSettings(parsed.emailSettings)
  }, [action, initialSubject, initialHtml])

  useEffect(() => {
    if (viewMode === 'visual') {
      const generated = generateHtmlFromBlocks(blocks, emailSettings)
      setRawHtml(generated)
    }
  }, [blocks, emailSettings, viewMode])

  // Drag and drop tracking
  const [draggedIndex, setDraggedIndex] = useState(null)
  const [dropTargetIndex, setDropTargetIndex] = useState(null)
  const fileInputRef = useRef(null)

  const handleResetToPreset = () => {
    if (!window.confirm('Reset this canvas to the standard action preset layout?')) return
    const presetBlocks = getPresetBlocksForAction(action, subject)
    setBlocks(presetBlocks)
    toast.success('Canvas reset to default action preset')
  }

  // Drag from toolbox into canvas
  const handleToolboxDragStart = (e, type) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ source: 'toolbox', type }))
    e.dataTransfer.effectAllowed = 'copy'
  }

  // Drag existing canvas block to reorder
  const handleCanvasDragStart = (e, index) => {
    setDraggedIndex(index)
    e.dataTransfer.setData('application/json', JSON.stringify({ source: 'canvas', index }))
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleCanvasDragOver = (e, index) => {
    e.preventDefault()
    setDropTargetIndex(index)
  }

  const handleCanvasDrop = (e, targetIndex) => {
    e.preventDefault()
    setDropTargetIndex(null)
    const rawData = e.dataTransfer.getData('application/json')
    if (!rawData) return

    try {
      const data = JSON.parse(rawData)
      if (data.source === 'toolbox') {
        const newBlock = createBlock(data.type)
        const updated = [...blocks]
        updated.splice(targetIndex, 0, newBlock)
        setBlocks(updated)
        setActiveBlockId(newBlock.id)
        toast.success(`Added ${data.type} section`)
      } else if (data.source === 'canvas') {
        if (draggedIndex === null || draggedIndex === targetIndex) return
        const updated = [...blocks]
        const [moved] = updated.splice(draggedIndex, 1)
        updated.splice(targetIndex, 0, moved)
        setDraggedIndex(null)
        setBlocks(updated)
      }
    } catch {
      // Ignored
    }
  }

  // Block management
  const addBlockAtEnd = (type) => {
    const newBlock = createBlock(type)
    setBlocks((prev) => [...prev, newBlock])
    setActiveBlockId(newBlock.id)
    toast.success(`Added ${type} section`)
  }

  const insertBlockAt = (index, type) => {
    const newBlock = createBlock(type)
    const updated = [...blocks]
    updated.splice(index, 0, newBlock)
    setBlocks(updated)
    setActiveBlockId(newBlock.id)
  }

  const deleteBlock = (id) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id))
    if (activeBlockId === id) setActiveBlockId(null)
  }

  const duplicateBlock = (block) => {
    const copy = {
      ...block,
      id: `blk_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    }
    const idx = blocks.findIndex((b) => b.id === block.id)
    const updated = [...blocks]
    updated.splice(idx + 1, 0, copy)
    setBlocks(updated)
    setActiveBlockId(copy.id)
  }

  const moveBlock = (index, dir) => {
    const targetIdx = index + dir
    if (targetIdx < 0 || targetIdx >= blocks.length) return
    const updated = [...blocks]
    const temp = updated[index]
    updated[index] = updated[targetIdx]
    updated[targetIdx] = temp
    setBlocks(updated)
  }

  const updateActiveBlock = (fields) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === activeBlockId ? { ...b, ...fields } : b))
    )
  }

  const activeBlock = useMemo(
    () => blocks.find((b) => b.id === activeBlockId) || null,
    [blocks, activeBlockId]
  )

  // Handle image upload from computer
  const handleImageFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await api.post('/upload/image', formData)
      const url = res?.upload?.url || res?.material?.url || res?.url

      if (url) {
        updateActiveBlock({ url })
        toast.success('Image uploaded successfully!')
      } else {
        // Fallback to local base64 preview
        const reader = new FileReader()
        reader.onload = (event) => {
          updateActiveBlock({ url: event.target.result })
          toast.success('Image loaded locally')
        }
        reader.readAsDataURL(file)
      }
    } catch {
      // Fallback to base64 on error
      const reader = new FileReader()
      reader.onload = (event) => {
        updateActiveBlock({ url: event.target.result })
        toast.success('Image loaded into template')
      }
      reader.readAsDataURL(file)
    } finally {
      setUploadingImage(false)
    }
  }

  // Insert variable tag into active input/block
  const insertVariable = (varName) => {
    const placeholder = `{{${varName}}}`
    if (activeBlock) {
      if (activeBlock.type === 'paragraph' || activeBlock.type === 'heading') {
        updateActiveBlock({ text: `${activeBlock.text || ''} ${placeholder}` })
      } else if (activeBlock.type === 'header') {
        updateActiveBlock({ title: `${activeBlock.title || ''} ${placeholder}` })
      } else if (activeBlock.type === 'button') {
        updateActiveBlock({ text: `${activeBlock.text || ''} ${placeholder}` })
      } else if (activeBlock.type === 'highlight_box') {
        updateActiveBlock({ body: `${activeBlock.body || ''} ${placeholder}` })
      } else {
        setSubject((prev) => `${prev} ${placeholder}`)
      }
    } else {
      setSubject((prev) => `${prev} ${placeholder}`)
    }
    toast.success(`Inserted ${placeholder}`)
  }

  // Compiled live preview HTML with substituted sample variables
  const previewHtml = useMemo(() => {
    let source = viewMode === 'code' ? rawHtml : generateHtmlFromBlocks(blocks, emailSettings)
    const vars = { ...DEFAULT_PREVIEW_VARS }
    return source.replace(/{{\s*(\w+)\s*}}/g, (_, key) =>
      vars[key] !== undefined ? vars[key] : `[${key}]`
    )
  }, [blocks, rawHtml, emailSettings, viewMode])

  const handleSave = () => {
    if (!subject.trim()) {
      return toast.error('Subject line is required')
    }
    const finalHtml = viewMode === 'code' ? rawHtml : generateHtmlFromBlocks(blocks, emailSettings)
    if (onSave) {
      onSave({
        subject,
        html_template: finalHtml,
      })
    }
  }

  const handleSendTest = async (e) => {
    e.preventDefault()
    if (!testEmailAddress.trim()) return toast.error('Enter recipient email')
    setIsSendingTest(true)
    try {
      if (onTestSend) {
        const currentHtml = viewMode === 'code' ? rawHtml : generateHtmlFromBlocks(blocks, emailSettings)
        await onTestSend(testEmailAddress.trim(), {
          subject,
          html_template: currentHtml,
        })
        toast.success(`Test email sent to ${testEmailAddress}`)
        setTestEmailModal(false)
      }
    } catch (err) {
      toast.error(err?.message || 'Failed to send test email')
    } finally {
      setIsSendingTest(false)
    }
  }

  return (
    <div className="flex h-full flex-col bg-slate-100">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 py-3.5 shadow-sm">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900">{title}</h2>
          <p className="text-xs text-slate-500">Drag & drop sections, upload images, and preview live on mobile/desktop</p>
        </div>

        {/* View mode switcher */}
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1">
            <button
              onClick={() => setViewMode('visual')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition ${
                viewMode === 'visual'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layout size={14} /> Drag & Drop Canvas
            </button>
            <button
              onClick={() => setViewMode('code')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition ${
                viewMode === 'code'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Code size={14} /> HTML Editor
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition ${
                viewMode === 'preview'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye size={14} /> Live Preview
            </button>
          </div>

          <button
            onClick={handleResetToPreset}
            title="Reset canvas blocks to standard action preset"
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          >
            <RotateCcw size={13} /> Reset Layout
          </button>

          <button
            onClick={() => setTestEmailModal(true)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            <Send size={14} /> Send Test Mail
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60"
          >
            <Save size={14} /> {isSaving ? 'Saving...' : 'Save Template'}
          </button>
        </div>
      </div>

      {/* Subject Line & Dynamic Variable Tag Bar */}
      <div className="border-b border-slate-200 bg-white px-6 py-3">
        <div className="mb-2 flex items-center gap-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Subject:</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Enter email subject line (e.g. Welcome to {{appName}})"
            className="flex-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
          />
        </div>

        {/* Dynamic Variable Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="flex items-center gap-1 text-xs font-bold text-indigo-600">
            <Sparkles size={13} /> Insert Tag:
          </span>
          {(initialVariables.length ? initialVariables : Object.keys(DEFAULT_PREVIEW_VARS)).map(
            (varKey) => (
              <button
                key={varKey}
                onClick={() => insertVariable(varKey)}
                className="rounded-full border border-indigo-200 bg-indigo-50/70 px-2.5 py-0.5 text-xs font-medium text-indigo-700 transition hover:bg-indigo-100"
              >
                + {`{{${varKey}}}`}
              </button>
            )
          )}
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Visual Builder Mode */}
        {viewMode === 'visual' && (
          <div className="flex flex-1 overflow-hidden">
            {/* Left Toolbox Sidebar */}
            <div className="w-72 border-r border-slate-200 bg-white p-4 overflow-y-auto">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  Toolbox & Sections
                </h3>
                <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700">
                  Drag & Drop
                </span>
              </div>
              <p className="mb-4 text-[11px] text-slate-400">
                Drag any block onto the canvas or click to add at the end.
              </p>

              <div className="space-y-2">
                {TOOLBOX_ITEMS.map((item) => {
                  const Icon = item.icon
                  return (
                    <div
                      key={item.type}
                      draggable
                      onDragStart={(e) => handleToolboxDragStart(e, item.type)}
                      onClick={() => addBlockAtEnd(item.type)}
                      className="group flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3 text-left transition cursor-grab active:cursor-grabbing hover:border-indigo-500 hover:bg-indigo-50/50 hover:shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-600 group-hover:bg-indigo-600 group-hover:text-white">
                          <Icon size={16} />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-800 group-hover:text-indigo-600">
                            {item.label}
                          </div>
                          <div className="text-[10px] text-slate-400">{item.desc}</div>
                        </div>
                      </div>
                      <Plus size={14} className="text-slate-300 group-hover:text-indigo-600" />
                    </div>
                  )
                })}
              </div>

              {/* Canvas Global Styling Card */}
              <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs">
                <div className="mb-2 flex items-center gap-1.5 font-bold text-slate-700">
                  <Palette size={14} className="text-indigo-600" /> Canvas Styling
                </div>
                <div className="space-y-2.5">
                  <div>
                    <label className="block text-[11px] text-slate-500">Outer Background</label>
                    <input
                      type="color"
                      value={emailSettings.bodyBg}
                      onChange={(e) => setEmailSettings({ ...emailSettings, bodyBg: e.target.value })}
                      className="h-7 w-full rounded border border-slate-200 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500">Inner Container</label>
                    <input
                      type="color"
                      value={emailSettings.containerBg}
                      onChange={(e) =>
                        setEmailSettings({ ...emailSettings, containerBg: e.target.value })
                      }
                      className="h-7 w-full rounded border border-slate-200 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Center Canvas Area */}
            <div
              style={{ backgroundColor: emailSettings.bodyBg }}
              className="flex-1 overflow-y-auto p-8"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleCanvasDrop(e, blocks.length)}
            >
              <div
                style={{
                  maxWidth: `${emailSettings.containerWidth}px`,
                  backgroundColor: emailSettings.containerBg,
                }}
                className="mx-auto rounded-xl border border-slate-200 shadow-md overflow-hidden"
              >
                {/* Canvas header banner */}
                <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-4 py-2 text-xs font-bold text-slate-500">
                  <span>Interactive Email Canvas</span>
                  <span>{blocks.length} Sections</span>
                </div>

                {/* Blocks List */}
                <div className="divide-y divide-slate-100">
                  {blocks.map((block, index) => {
                    const isSelected = activeBlockId === block.id
                    const isDropTarget = dropTargetIndex === index

                    return (
                      <div key={block.id}>
                        {/* Drop indicator line */}
                        {isDropTarget && (
                          <div className="h-1 bg-indigo-600 shadow-sm animate-pulse" />
                        )}

                        <div
                          draggable
                          onDragStart={(e) => handleCanvasDragStart(e, index)}
                          onDragOver={(e) => handleCanvasDragOver(e, index)}
                          onClick={() => setActiveBlockId(block.id)}
                          className={`group relative transition cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-50/40 ring-2 ring-indigo-600 ring-inset'
                              : 'hover:bg-slate-50/70'
                          }`}
                        >
                          {/* Drag handle & action controls overlay */}
                          <div className="absolute left-2 top-2 z-10 hidden items-center gap-1 rounded bg-slate-900/80 p-1 text-white shadow group-hover:flex">
                            <span title="Drag to reorder" className="cursor-grab active:cursor-grabbing p-1">
                              <GripVertical size={13} />
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                moveBlock(index, -1)
                              }}
                              disabled={index === 0}
                              className="p-1 hover:text-indigo-300 disabled:opacity-30"
                            >
                              <ChevronUp size={13} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                moveBlock(index, 1)
                              }}
                              disabled={index === blocks.length - 1}
                              className="p-1 hover:text-indigo-300 disabled:opacity-30"
                            >
                              <ChevronDown size={13} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                duplicateBlock(block)
                              }}
                              className="p-1 hover:text-indigo-300"
                            >
                              <Copy size={13} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteBlock(block.id)
                              }}
                              className="p-1 hover:text-red-400"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>

                          {/* Render Section Block on Canvas */}
                          <div className="p-3">
                            {block.type === 'header' && (
                              <div
                                style={{ backgroundColor: block.bgColor, color: block.textColor }}
                                className="rounded-lg p-6 text-center"
                              >
                                {block.logoUrl && (
                                  <img src={block.logoUrl} alt="Logo" className="mx-auto mb-2 max-h-12" />
                                )}
                                <h2 className="text-xl font-bold">
                                  {block.icon} {block.title}
                                </h2>
                                {block.subtitle && (
                                  <p className="mt-1 text-xs opacity-90">{block.subtitle}</p>
                                )}
                              </div>
                            )}

                            {block.type === 'heading' && (
                              <div style={{ textAlign: block.align }}>
                                <h3
                                  style={{
                                    color: block.color,
                                    fontSize: block.fontSize ? `${block.fontSize}px` : '20px',
                                  }}
                                  className="font-bold"
                                >
                                  {block.text}
                                </h3>
                              </div>
                            )}

                            {block.type === 'paragraph' && (
                              <div style={{ textAlign: block.align }}>
                                <p
                                  style={{
                                    color: block.color,
                                    fontSize: block.fontSize ? `${block.fontSize}px` : '15px',
                                    lineHeight: block.lineHeight || 1.65,
                                  }}
                                  className="whitespace-pre-line leading-relaxed"
                                >
                                  {block.text}
                                </p>
                              </div>
                            )}

                            {block.type === 'button' && (
                              <div style={{ textAlign: block.align }} className="py-2">
                                <span
                                  style={{
                                    backgroundColor: block.bgColor,
                                    color: block.textColor,
                                    borderRadius: `${block.borderRadius || 8}px`,
                                    display: block.fullWidth ? 'block' : 'inline-block',
                                  }}
                                  className="px-6 py-2.5 text-sm font-bold shadow"
                                >
                                  {block.text}
                                </span>
                              </div>
                            )}

                            {block.type === 'image' && (
                              <div style={{ textAlign: block.align }} className="py-2">
                                <img
                                  src={block.url}
                                  alt={block.alt}
                                  style={{
                                    width: `${block.width || 100}%`,
                                    borderRadius: `${block.borderRadius || 8}px`,
                                  }}
                                  className="mx-auto max-h-64 object-cover"
                                />
                              </div>
                            )}

                            {block.type === 'two_columns' && (
                              <div className="grid grid-cols-2 gap-3 py-2">
                                <div
                                  style={{
                                    backgroundColor: block.bgColor || '#f8fafc',
                                    borderColor: block.borderColor || '#e2e8f0',
                                  }}
                                  className="rounded-lg border p-3.5"
                                >
                                  <h4 className="font-bold text-slate-800 text-xs mb-1">
                                    {block.col1Title}
                                  </h4>
                                  <p className="text-[11px] text-slate-600">{block.col1Text}</p>
                                </div>
                                <div
                                  style={{
                                    backgroundColor: block.bgColor || '#f8fafc',
                                    borderColor: block.borderColor || '#e2e8f0',
                                  }}
                                  className="rounded-lg border p-3.5"
                                >
                                  <h4 className="font-bold text-slate-800 text-xs mb-1">
                                    {block.col2Title}
                                  </h4>
                                  <p className="text-[11px] text-slate-600">{block.col2Text}</p>
                                </div>
                              </div>
                            )}

                            {block.type === 'highlight_box' && (
                              <div
                                style={{
                                  backgroundColor: block.bgColor,
                                  borderColor: block.borderColor,
                                }}
                                className="rounded-r-lg border-l-4 p-4 text-xs"
                              >
                                {block.title && (
                                  <h4 className="mb-2 font-bold text-slate-800">{block.title}</h4>
                                )}
                                <div className="whitespace-pre-line text-slate-600">{block.body}</div>
                              </div>
                            )}

                            {block.type === 'key_value' && (
                              <div
                                style={{ backgroundColor: block.bgColor }}
                                className="rounded-lg border border-slate-200 p-4 text-xs"
                              >
                                {block.title && (
                                  <h4 className="mb-3 font-bold text-slate-800">{block.title}</h4>
                                )}
                                <div className="space-y-1.5">
                                  {(block.items || []).map((item, idx) => (
                                    <div
                                      key={idx}
                                      className="flex justify-between border-b border-slate-100 pb-1"
                                    >
                                      <span className="text-slate-500">{item.key}</span>
                                      <span className="font-bold text-slate-800">{item.value}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {block.type === 'divider' && (
                              <hr
                                style={{
                                  borderColor: block.color,
                                  borderTopWidth: block.thickness,
                                  margin: `${block.spacing}px 0`,
                                }}
                              />
                            )}

                            {block.type === 'footer' && (
                              <div
                                style={{ backgroundColor: block.bgColor, color: block.color }}
                                className="rounded-b-lg p-4 text-center text-xs"
                              >
                                <p className="whitespace-pre-line">{block.text}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Bottom Canvas Add Bar */}
                <div className="border-t border-dashed border-slate-200 bg-slate-50/50 p-4 text-center">
                  <span className="text-xs text-slate-400 font-medium">
                    + Drag sections from toolbox to add anywhere in canvas
                  </span>
                </div>
              </div>
            </div>

            {/* Right Property Inspector Sidebar */}
            <div className="w-80 border-l border-slate-200 bg-white p-5 overflow-y-auto">
              <h3 className="mb-4 text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Sliders size={14} className="text-indigo-600" /> Section Properties
              </h3>

              {activeBlock ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-700">
                    <span>{activeBlock.type.toUpperCase()} BLOCK</span>
                    <button
                      onClick={() => deleteBlock(activeBlock.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* Header Block Properties */}
                  {activeBlock.type === 'header' && (
                    <>
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-slate-600">
                          Header Title
                        </label>
                        <input
                          type="text"
                          value={activeBlock.title || ''}
                          onChange={(e) => updateActiveBlock({ title: e.target.value })}
                          className="w-full rounded border border-slate-300 p-2 text-xs"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-slate-600">
                          Subtitle
                        </label>
                        <input
                          type="text"
                          value={activeBlock.subtitle || ''}
                          onChange={(e) => updateActiveBlock({ subtitle: e.target.value })}
                          className="w-full rounded border border-slate-300 p-2 text-xs"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="mb-1 block text-xs font-semibold text-slate-600">
                            Emoji / Icon
                          </label>
                          <input
                            type="text"
                            value={activeBlock.icon || ''}
                            onChange={(e) => updateActiveBlock({ icon: e.target.value })}
                            className="w-full rounded border border-slate-300 p-2 text-xs"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-semibold text-slate-600">
                            Background
                          </label>
                          <input
                            type="color"
                            value={activeBlock.bgColor || '#4f46e5'}
                            onChange={(e) => updateActiveBlock({ bgColor: e.target.value })}
                            className="h-8 w-full rounded border border-slate-300"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Heading & Paragraph Properties */}
                  {(activeBlock.type === 'heading' || activeBlock.type === 'paragraph') && (
                    <>
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-slate-600">
                          Text Content
                        </label>
                        <textarea
                          rows={5}
                          value={activeBlock.text || ''}
                          onChange={(e) => updateActiveBlock({ text: e.target.value })}
                          className="w-full rounded border border-slate-300 p-2 text-xs font-sans"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="mb-1 block text-xs font-semibold text-slate-600">
                            Font Size (px)
                          </label>
                          <input
                            type="number"
                            value={activeBlock.fontSize || (activeBlock.type === 'heading' ? 22 : 15)}
                            onChange={(e) =>
                              updateActiveBlock({ fontSize: Number(e.target.value) })
                            }
                            className="w-full rounded border border-slate-300 p-1.5 text-xs"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-semibold text-slate-600">
                            Color
                          </label>
                          <input
                            type="color"
                            value={activeBlock.color || '#334155'}
                            onChange={(e) => updateActiveBlock({ color: e.target.value })}
                            className="h-8 w-full rounded border border-slate-300"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-slate-600">
                          Alignment
                        </label>
                        <div className="grid grid-cols-3 gap-1 rounded bg-slate-100 p-1">
                          {['left', 'center', 'right'].map((align) => (
                            <button
                              key={align}
                              onClick={() => updateActiveBlock({ align })}
                              className={`rounded py-1 text-xs font-bold capitalize ${
                                activeBlock.align === align
                                  ? 'bg-white shadow text-indigo-600'
                                  : 'text-slate-600'
                              }`}
                            >
                              {align}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Button Properties */}
                  {activeBlock.type === 'button' && (
                    <>
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-slate-600">
                          Button Text
                        </label>
                        <input
                          type="text"
                          value={activeBlock.text || ''}
                          onChange={(e) => updateActiveBlock({ text: e.target.value })}
                          className="w-full rounded border border-slate-300 p-2 text-xs"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-slate-600">
                          Target URL
                        </label>
                        <input
                          type="text"
                          value={activeBlock.url || ''}
                          onChange={(e) => updateActiveBlock({ url: e.target.value })}
                          className="w-full rounded border border-slate-300 p-2 text-xs"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="mb-1 block text-xs font-semibold text-slate-600">
                            Button Color
                          </label>
                          <input
                            type="color"
                            value={activeBlock.bgColor || '#4f46e5'}
                            onChange={(e) => updateActiveBlock({ bgColor: e.target.value })}
                            className="h-8 w-full rounded border border-slate-300"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-semibold text-slate-600">
                            Text Color
                          </label>
                          <input
                            type="color"
                            value={activeBlock.textColor || '#ffffff'}
                            onChange={(e) => updateActiveBlock({ textColor: e.target.value })}
                            className="h-8 w-full rounded border border-slate-300"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="checkbox"
                          id="fullWidth"
                          checked={Boolean(activeBlock.fullWidth)}
                          onChange={(e) => updateActiveBlock({ fullWidth: e.target.checked })}
                          className="rounded text-indigo-600"
                        />
                        <label htmlFor="fullWidth" className="text-xs font-semibold text-slate-700">
                          Full Width Button
                        </label>
                      </div>
                    </>
                  )}

                  {/* Image Upload & Properties */}
                  {activeBlock.type === 'image' && (
                    <>
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-slate-600">
                          Upload Image File
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          ref={fileInputRef}
                          onChange={handleImageFileUpload}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingImage}
                          className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-indigo-400 bg-indigo-50/50 py-3 text-xs font-bold text-indigo-600 hover:bg-indigo-50"
                        >
                          <UploadCloud size={16} />
                          {uploadingImage ? 'Uploading Image...' : 'Click to Upload Image'}
                        </button>
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-semibold text-slate-600">
                          Or Image URL
                        </label>
                        <input
                          type="text"
                          value={activeBlock.url || ''}
                          onChange={(e) => updateActiveBlock({ url: e.target.value })}
                          className="w-full rounded border border-slate-300 p-2 text-xs"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-semibold text-slate-600">
                          Click Destination Link
                        </label>
                        <input
                          type="text"
                          value={activeBlock.link || ''}
                          onChange={(e) => updateActiveBlock({ link: e.target.value })}
                          className="w-full rounded border border-slate-300 p-2 text-xs"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="mb-1 block text-xs font-semibold text-slate-600">
                            Width (%)
                          </label>
                          <input
                            type="number"
                            min="20"
                            max="100"
                            value={activeBlock.width || 100}
                            onChange={(e) => updateActiveBlock({ width: Number(e.target.value) })}
                            className="w-full rounded border border-slate-300 p-1.5 text-xs"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-semibold text-slate-600">
                            Border Radius
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="24"
                            value={activeBlock.borderRadius || 8}
                            onChange={(e) =>
                              updateActiveBlock({ borderRadius: Number(e.target.value) })
                            }
                            className="w-full rounded border border-slate-300 p-1.5 text-xs"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* 2-Columns Properties */}
                  {activeBlock.type === 'two_columns' && (
                    <>
                      <div className="space-y-2 border-b border-slate-100 pb-3">
                        <label className="text-xs font-bold text-slate-700">Column 1 (Left)</label>
                        <input
                          type="text"
                          value={activeBlock.col1Title || ''}
                          onChange={(e) => updateActiveBlock({ col1Title: e.target.value })}
                          placeholder="Col 1 Title"
                          className="w-full rounded border border-slate-300 p-1.5 text-xs"
                        />
                        <textarea
                          rows={2}
                          value={activeBlock.col1Text || ''}
                          onChange={(e) => updateActiveBlock({ col1Text: e.target.value })}
                          placeholder="Col 1 Text"
                          className="w-full rounded border border-slate-300 p-1.5 text-xs"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700">Column 2 (Right)</label>
                        <input
                          type="text"
                          value={activeBlock.col2Title || ''}
                          onChange={(e) => updateActiveBlock({ col2Title: e.target.value })}
                          placeholder="Col 2 Title"
                          className="w-full rounded border border-slate-300 p-1.5 text-xs"
                        />
                        <textarea
                          rows={2}
                          value={activeBlock.col2Text || ''}
                          onChange={(e) => updateActiveBlock({ col2Text: e.target.value })}
                          placeholder="Col 2 Text"
                          className="w-full rounded border border-slate-300 p-1.5 text-xs"
                        />
                      </div>
                    </>
                  )}

                  {/* Highlight Box Properties */}
                  {activeBlock.type === 'highlight_box' && (
                    <>
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-slate-600">
                          Box Header
                        </label>
                        <input
                          type="text"
                          value={activeBlock.title || ''}
                          onChange={(e) => updateActiveBlock({ title: e.target.value })}
                          className="w-full rounded border border-slate-300 p-2 text-xs"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-slate-600">
                          Box Body Copy
                        </label>
                        <textarea
                          rows={4}
                          value={activeBlock.body || ''}
                          onChange={(e) => updateActiveBlock({ body: e.target.value })}
                          className="w-full rounded border border-slate-300 p-2 text-xs"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="mb-1 block text-xs font-semibold text-slate-600">
                            Accent Border
                          </label>
                          <input
                            type="color"
                            value={activeBlock.borderColor || '#6366f1'}
                            onChange={(e) => updateActiveBlock({ borderColor: e.target.value })}
                            className="h-8 w-full rounded border border-slate-300"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-semibold text-slate-600">
                            Background
                          </label>
                          <input
                            type="color"
                            value={activeBlock.bgColor || '#f8fafc'}
                            onChange={(e) => updateActiveBlock({ bgColor: e.target.value })}
                            className="h-8 w-full rounded border border-slate-300"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Footer Properties */}
                  {activeBlock.type === 'footer' && (
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-600">
                        Footer Disclaimer & Copyright
                      </label>
                      <textarea
                        rows={3}
                        value={activeBlock.text || ''}
                        onChange={(e) => updateActiveBlock({ text: e.target.value })}
                        className="w-full rounded border border-slate-300 p-2 text-xs"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-xs text-slate-400">
                  <MousePointerClick size={28} className="mx-auto mb-2 text-slate-300" />
                  Click on any section block in the canvas to customize its typography, colors, padding, and layout.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Raw HTML Code View */}
        {viewMode === 'code' && (
          <div className="flex-1 p-6">
            <div className="h-full rounded-xl border border-slate-300 bg-slate-900 p-4 font-mono text-xs text-emerald-400 shadow-inner">
              <textarea
                value={rawHtml}
                onChange={(e) => setRawHtml(e.target.value)}
                className="h-full w-full bg-transparent font-mono text-emerald-400 focus:outline-none"
                spellCheck={false}
              />
            </div>
          </div>
        )}

        {/* Live Responsive Preview View */}
        {viewMode === 'preview' && (
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Device switcher bar */}
            <div className="flex justify-center gap-2 border-b border-slate-200 bg-white p-2.5 shadow-sm">
              <button
                onClick={() => setPreviewDevice('desktop')}
                className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-bold ${
                  previewDevice === 'desktop'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Monitor size={14} /> Desktop (600px)
              </button>
              <button
                onClick={() => setPreviewDevice('mobile')}
                className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-bold ${
                  previewDevice === 'mobile'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Smartphone size={14} /> Mobile (375px)
              </button>
            </div>

            {/* Preview Frame */}
            <div className="flex-1 overflow-y-auto bg-slate-200 p-8 flex justify-center items-start">
              <div
                style={{ width: previewDevice === 'mobile' ? '375px' : '600px' }}
                className="rounded-xl bg-white shadow-2xl overflow-hidden transition-all duration-200 border border-slate-300"
              >
                <iframe
                  title="Email Preview"
                  srcDoc={previewHtml}
                  className="w-full min-h-[600px] border-0"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Test Email Modal */}
      {testEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <h3 className="text-base font-extrabold text-slate-900">Send Test Email</h3>
            <p className="mt-1 text-xs text-slate-500">
              Send a test email with sample data to verify design rendering and SMTP delivery.
            </p>

            <form onSubmit={handleSendTest} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">Recipient Email</label>
                <input
                  type="email"
                  required
                  placeholder="your-email@example.com"
                  value={testEmailAddress}
                  onChange={(e) => setTestEmailAddress(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTestEmailModal(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSendingTest}
                  className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-60"
                >
                  <Send size={14} /> {isSendingTest ? 'Sending...' : 'Send Test'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
