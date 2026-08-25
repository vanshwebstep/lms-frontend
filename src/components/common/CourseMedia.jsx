import { PlayCircle } from 'lucide-react'
import { resolveMediaUrl } from '../../utils/media'
import { getVideoEmbedUrl, isDirectVideoUrl } from '../../utils/video'

export default function CourseMedia({ course, className = '', compact = false }) {
  const title = course?.title || 'Course media'
  const thumbnailUrl = resolveMediaUrl(course?.thumbnailUrl)
  const promoVideo = course?.promoVideo || ''
  const videoUrl = resolveMediaUrl(promoVideo)
  const embedUrl = getVideoEmbedUrl(promoVideo, { compact })
  const canPlayDirect = videoUrl && isDirectVideoUrl(videoUrl)

  if (canPlayDirect) {
    return (
      <video
        className={`h-full w-full object-cover ${className}`}
        src={videoUrl}
        poster={thumbnailUrl || undefined}
        controls={!compact}
        autoPlay={compact}
        muted={compact}
        loop={compact}
        preload={compact ? 'auto' : 'metadata'}
        playsInline
        aria-label={`${title} promo video`}
      />
    )
  }

  if (embedUrl) {
    return <iframe className={`h-full w-full ${compact ? 'pointer-events-none' : ''} ${className}`} src={embedUrl} title={`${title} promo video`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
  }

  return (
    <div className={`relative h-full w-full overflow-hidden bg-gradient-to-br from-indigo-100 to-sky-100 ${className}`}>
      {thumbnailUrl ? <img src={thumbnailUrl} alt={title} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-5xl font-black text-indigo-500">{title[0] || 'C'}</div>}
      {promoVideo && <div className="absolute inset-0 flex items-center justify-center bg-slate-950/20"><span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-indigo-700 shadow-lg"><PlayCircle size={26} /></span></div>}
    </div>
  )
}