import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle, Clock, PlayCircle, Star, Users } from 'lucide-react'
import api from '../../services/api'
import { formatCurrency } from '../../utils/formatters'
import RichTextContent from '../../components/common/RichTextContent'
import CourseMedia from '../../components/common/CourseMedia'

const CourseDetail = () => {
  const { id } = useParams()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    const load = async () => {
      try {
        setLoading(true)
        const res = await api.get('/student/courses/browse')
        const found = (res.courses || []).find((item) => String(item.id) === String(id))
        if (alive) setCourse(found || null)
      } catch (err) {
        if (alive) setError(err?.message || 'Failed to load course')
      } finally {
        if (alive) setLoading(false)
      }
    }
    load()
    return () => { alive = false }
  }, [id])

  if (loading) return <div className="rounded-lg bg-white p-10 text-center text-slate-500 shadow-sm">Loading course...</div>
  if (error) return <div className="rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-600">{error}</div>
  if (!course) return <div className="rounded-lg bg-white p-10 text-center text-slate-500 shadow-sm">Course not found</div>

  const outcomes = course.outcomes?.length ? course.outcomes : ['Course content and assignments will appear after enrollment']
  const enrolled = Boolean(course.isEnrolled)
  const progress = Number(course.enrollment?.progress || 0)

  return (
    <div className="space-y-6">
      <Link to="/student/courses" className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700"><ArrowLeft size={16} /> Back to courses</Link>
      <section className="grid gap-5 rounded-lg bg-slate-900 p-6 text-white lg:grid-cols-[1fr_320px]">
        <div>
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-indigo-100">{course.category}</span>
          {enrolled && <span className="ml-2 rounded-full bg-green-500 px-3 py-1 text-xs font-black text-white">Already bought</span>}
          <h1 className="mt-4 text-3xl font-extrabold text-white">{course.title}</h1>
          <RichTextContent html={course.description} dark className="mt-3 max-w-2xl" />
          <div className="mt-5 flex flex-wrap gap-4 text-sm text-slate-200">
            <span className="flex items-center gap-2"><Users size={16} /> {course.students || 0} students</span>
            <span className="flex items-center gap-2"><Clock size={16} /> {course.difficulty}</span>
            <span className="flex items-center gap-2"><Star size={16} className="text-amber-400" /> {course.language}</span>
          </div>
        </div>
        <aside className="rounded-lg bg-white p-5 text-slate-900">
          <div className="mb-4 aspect-video overflow-hidden rounded-lg bg-slate-950"><CourseMedia course={course} /></div>
          <p className="text-sm font-semibold text-slate-500">{enrolled ? 'Your access' : 'Lifetime access'}</p>
          <p className={`mt-1 text-3xl font-extrabold ${enrolled ? 'text-green-700' : 'text-slate-900'}`}>{enrolled ? 'Already bought' : formatCurrency(course.price || 0, course.currency || 'INR')}</p>
          {enrolled ? (
            <>
              <div className="mt-4 rounded-lg bg-green-50 p-3">
                <div className="flex justify-between text-xs font-bold text-green-800"><span>Progress</span><span>{progress}%</span></div>
                <div className="mt-2 h-2 rounded-full bg-green-100"><div className="h-2 rounded-full bg-green-600" style={{ width: `${progress}%` }} /></div>
              </div>
              <Link to={`/student/learn/${course.id}`} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-sm font-bold text-white hover:bg-green-700"><PlayCircle size={18} /> Continue Learning</Link>
            </>
          ) : (
            <Link to={`/student/checkout/${course.id}`} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-bold text-white hover:bg-indigo-700"><PlayCircle size={18} /> Enroll Now</Link>
          )}
          <div className="mt-5 space-y-2 text-sm text-slate-600">
            <p className="flex items-center gap-2"><CheckCircle size={16} className="text-green-600" /> Coach: {course.coach?.name || 'Coach'}</p>
            <p className="flex items-center gap-2"><CheckCircle size={16} className="text-green-600" /> {course.language} language</p>
            <p className="flex items-center gap-2"><CheckCircle size={16} className="text-green-600" /> Certificate-ready flow</p>
          </div>
        </aside>
      </section>
      <section className="rounded-lg bg-white p-5 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">Learning Outcomes</h2>
        <div className="mt-4 divide-y divide-slate-100 rounded-lg border border-slate-200">
          {outcomes.map((item, index) => (
            <div key={`${item}-${index}`} className="flex items-center justify-between gap-4 p-4">
              <div><h3 className="font-semibold text-slate-900">{item}</h3><p className="mt-1 text-sm text-slate-500">Outcome {index + 1}</p></div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">Included</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default CourseDetail
