import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, CheckCircle, Clock, Star, Users } from 'lucide-react'
import api from '../../services/api'
import { formatCurrency } from '../../utils/formatters'
import CourseMedia from '../../components/common/CourseMedia'

const CourseCatalog = () => {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    const load = async () => {
      try {
        setLoading(true)
        const res = await api.get('/student/courses/browse')
        if (alive) setCourses(res.courses || [])
      } catch (err) {
        if (alive) setError(err?.message || 'Failed to load courses')
      } finally {
        if (alive) setLoading(false)
      }
    }
    load()
    return () => { alive = false }
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Available Courses</h2>
        <p className="mt-1 text-sm text-slate-500">Browse live courses from coaches. Purchased courses are marked here.</p>
      </div>
      {error && <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
      {loading ? (
        <div className="rounded-lg bg-white p-10 text-center text-slate-500 shadow-sm">Loading courses...</div>
      ) : courses.length === 0 ? (
        <div className="rounded-lg bg-white p-10 text-center text-slate-500 shadow-sm">No published courses available</div>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {courses.map((course) => {
            const enrolled = Boolean(course.isEnrolled)
            const progress = Number(course.enrollment?.progress || 0)
            return (
              <article key={course.id} className={`overflow-hidden rounded-lg bg-white shadow-sm ring-1 ${enrolled ? 'ring-green-100' : 'ring-transparent'}`}>
                <div className="relative h-36 overflow-hidden bg-slate-900">
                  <CourseMedia course={course} compact />
                  {enrolled && <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-green-600 px-3 py-1 text-xs font-black text-white"><CheckCircle size={13} /> Enrolled</span>}
                </div>
                <div className="space-y-4 p-5">
                  <div>
                    <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-600">{course.category}</span>
                    <h3 className="mt-3 text-lg font-bold leading-snug text-slate-900">{course.title}</h3>
                    <p className="mt-1 text-sm text-slate-500">By {course.coach?.name || 'Coach'}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><Users size={14} /> {course.students || 0}</span>
                    <span className="flex items-center gap-1"><Clock size={14} /> {course.difficulty}</span>
                    <span className="flex items-center gap-1"><Star size={14} className="text-amber-500" /> Live</span>
                  </div>
                  {enrolled && (
                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-500"><span>Your progress</span><span>{progress}%</span></div>
                      <div className="mt-2 h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-green-500" style={{ width: `${progress}%` }} /></div>
                    </div>
                  )}
                  <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                    <span className={enrolled ? 'text-sm font-black text-green-700' : 'text-lg font-extrabold text-indigo-600'}>
                      {enrolled ? 'Already bought' : formatCurrency(course.price || 0, course.currency || 'INR')}
                    </span>
                    <Link to={enrolled ? `/student/learn/${course.id}` : `/student/courses/${course.id}`} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-white ${enrolled ? 'bg-green-600 hover:bg-green-700' : 'bg-slate-900 hover:bg-slate-800'}`}>
                      {enrolled && <BookOpen size={15} />}{enrolled ? 'Continue' : 'View Syllabus'}
                    </Link>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default CourseCatalog
