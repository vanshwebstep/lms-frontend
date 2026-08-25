import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { CreditCard, ShieldCheck, Lock, ArrowLeft, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { formatCurrency } from '../../utils/formatters'

const Checkout = () => {
  const { planId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '9876543210',
    cardNumber: '4242 4242 4242 4242',
    expiry: '12/30',
    cvc: '123',
  })

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        name: prev.name || user.name || '',
        email: prev.email || user.email || '',
      }))
    }
  }, [user])

  useEffect(() => {
    let alive = true
    const load = async () => {
      try {
        const res = await api.get('/student/courses/browse')
        const found = (res.courses || []).find((item) => String(item.id) === String(planId))
        if (alive) setCourse(found || null)
      } catch (err) {
        toast.error(err?.message || 'Failed to load course')
      } finally {
        if (alive) setLoading(false)
      }
    }
    load()
    return () => {
      alive = false
    }
  }, [planId])

  const change = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }))

  const handlePayment = async (e) => {
    e.preventDefault()
    if (!course) return toast.error('Course not found')

    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      return toast.error('Please fill in your name, email, and phone number')
    }
    if (!form.cardNumber.trim() || !form.expiry.trim() || !form.cvc.trim()) {
      return toast.error('Please enter valid Stripe card details')
    }

    setPaying(true)
    try {
      const payload = {
        course_id: course.id,
        courseId: course.id,
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        card_number: form.cardNumber.trim(),
        cardNumber: form.cardNumber.trim(),
        expiry: form.expiry.trim(),
        cvc: form.cvc.trim(),
      }

      const res = await api.post('/payments/checkout', payload)

      if (res?.alreadyEnrolled) {
        toast.success('You are already enrolled in this course!')
        navigate('/student/dashboard')
        return
      }

      toast.success(res?.message || 'Stripe payment successful! Course added to your learning.')
      navigate('/student/dashboard')
    } catch (err) {
      toast.error(err?.message || 'Stripe payment failed. Please check card details.')
    } finally {
      setPaying(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center text-slate-600">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        <p className="mt-4 text-sm font-medium">Loading checkout details...</p>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800">Course Not Found</h2>
        <p className="mt-2 text-sm text-slate-500">The course you are trying to purchase does not exist or is unavailable.</p>
        <Link
          to="/student/courses"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          <ArrowLeft size={16} /> Back to Courses
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link
            to={`/student/courses/${course.id}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft size={16} /> Back to Course Details
          </Link>
          <h1 className="mt-2 text-2xl font-extrabold text-slate-900">Stripe Secure Checkout</h1>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          <ShieldCheck size={16} /> 256-bit Encrypted
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Payment Form */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-7">
          <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <CreditCard className="text-indigo-600" size={22} />
              <h2 className="text-lg font-bold text-slate-900">Payment Details</h2>
            </div>
            <span className="rounded bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
              Stripe Test Gateway
            </span>
          </div>

          <form onSubmit={handlePayment} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600">Full Name</label>
              <input
                type="text"
                name="name"
                required
                value={form.name}
                onChange={change}
                placeholder="Your Full Name"
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 transition focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600">Email Address</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={form.email}
                  onChange={change}
                  placeholder="name@example.com"
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 transition focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  required
                  value={form.phone}
                  onChange={change}
                  placeholder="9876543210"
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 transition focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600">Card Number</label>
              <div className="relative">
                <input
                  type="text"
                  name="cardNumber"
                  required
                  value={form.cardNumber}
                  onChange={change}
                  placeholder="4242 4242 4242 4242"
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 pr-10 font-mono text-sm text-slate-900 transition focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                />
                <CreditCard className="absolute right-3 top-3 text-slate-400" size={18} />
              </div>
              <p className="mt-1 text-xs text-slate-400">Use test card 4242 4242 4242 4242 for testing.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600">Expiry (MM/YY)</label>
                <input
                  type="text"
                  name="expiry"
                  required
                  value={form.expiry}
                  onChange={change}
                  placeholder="12/30"
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 font-mono text-sm text-slate-900 transition focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600">CVC</label>
                <input
                  type="text"
                  name="cvc"
                  required
                  value={form.cvc}
                  onChange={change}
                  placeholder="123"
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 font-mono text-sm text-slate-900 transition focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={paying}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {paying ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Processing Stripe Payment...
                </>
              ) : (
                <>
                  <Lock size={16} /> Pay {formatCurrency(course.price || 0, course.currency || 'INR')} with Stripe
                </>
              )}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-5">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900">Order Summary</h3>
            <div className="mt-4 space-y-3 border-b border-slate-200 pb-4">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-slate-700">{course.title}</span>
                <span className="font-semibold text-slate-900">{formatCurrency(course.price || 0, course.currency || 'INR')}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Category</span>
                <span>{course.category}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Taxes & Fees</span>
                <span>{formatCurrency(0, course.currency || 'INR')}</span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-base font-extrabold text-slate-900">
              <span>Total Due</span>
              <span className="text-lg text-indigo-600">{formatCurrency(course.price || 0, course.currency || 'INR')}</span>
            </div>

            <div className="mt-6 space-y-2 rounded-lg bg-white p-4 text-xs text-slate-600 border border-slate-200">
              <div className="flex items-center gap-2 font-medium text-slate-800">
                <CheckCircle2 size={16} className="text-emerald-600" /> Lifetime access to all modules
              </div>
              <div className="flex items-center gap-2 font-medium text-slate-800">
                <CheckCircle2 size={16} className="text-emerald-600" /> Certificate of completion included
              </div>
              <div className="flex items-center gap-2 font-medium text-slate-800">
                <CheckCircle2 size={16} className="text-emerald-600" /> Instant activation on payment
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout

