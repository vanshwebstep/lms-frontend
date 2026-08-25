import { sanitizeRichText } from '../../utils/richText'

export default function RichTextContent({ html = '', dark = false, className = '' }) {
  const safeHtml = sanitizeRichText(html)
  if (!safeHtml) return null

  const tone = dark
    ? 'text-slate-300 [&_a]:text-sky-300 [&_blockquote]:border-sky-300/60 [&_blockquote]:bg-white/10 [&_hr]:border-white/20 [&_pre]:bg-white/10 [&_pre]:text-slate-100'
    : 'text-slate-600 [&_a]:text-indigo-600 [&_blockquote]:border-indigo-200 [&_blockquote]:bg-indigo-50 [&_hr]:border-slate-200 [&_pre]:bg-slate-900 [&_pre]:text-slate-100'

  return (
    <div
      className={`space-y-3 text-sm leading-6 ${tone} [&_a]:font-bold [&_blockquote]:border-l-4 [&_blockquote]:px-4 [&_blockquote]:py-2 [&_h2]:text-xl [&_h2]:font-black [&_h3]:text-lg [&_h3]:font-black [&_h4]:font-bold [&_hr]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_pre]:overflow-auto [&_pre]:rounded-lg [&_pre]:p-3 [&_pre]:font-mono [&_ul]:list-disc [&_ul]:pl-6 ${className}`}
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  )
}