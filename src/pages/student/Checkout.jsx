import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../../services/api'
import { formatCurrency } from '../../utils/formatters'

const Checkout = () => {
  const { planId } = useParams()
  const navigate = useNavigate()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [form, setForm] = useState({ name: 'Rohan Student', email: 'student@learnflow.local', phone: '7777777777', cardNumber: '4242 4242 4242 4242', expiry: '12/30', cvc: '123' })

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
    return () => { alive = false }
  }, [planId])

  const change = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }))
  const valueOrDemo = (value, fallback) => String(value || '').trim() || fallback

  const handlePayment = async (e) => {
    e.preventDefault()
    if (!course) return toast.error('Course not found')
    setPaying(true)
    try {
      const studentDetails = {
        name: valueOrDemo(form.name, 'Demo Student'),
        email: valueOrDemo(form.email, 'demo@student.local'),
        phone: valueOrDemo(form.phone, '0000000000'),
      }
      const order = await api.post('/payments/create-order', { courseId: course.id, studentDetails })
      const cardDigits = String(form.cardNumber || '').replace(/\D/g, '')
      await api.post('/payments/verify', {
        courseId: course.id,
        orderId: order.orderId,
        paymentId: `demo_${Date.now()}`,
        studentDetails,
        payment: {
          provider: 'demo',
          demo: true,
          status: 'success',
          enteredCard: valueOrDemo(form.cardNumber, 'demo-card'),
          last4: cardDigits.slice(-4) || 'demo',
          expiry: valueOrDemo(form.expiry, 'demo-expiry'),
          cvcProvided: Boolean(String(form.cvc || '').trim()),
        },
      })
      toast.success('Demo payment successful. Course added to your learning.')
      navigate('/student/dashboard')
    } catch (err) {
      toast.error(err?.message || 'Payment failed')
    } finally {
      setPaying(false)
    }
  }

  if (loading) return <div style={{ maxWidth: '800px', margin: '40px auto', padding: '30px', background: '#fff' }}>Loading checkout...</div>
  if (!course) return <div style={{ maxWidth: '800px', margin: '40px auto', padding: '30px', background: '#fff' }}>Course not found</div>

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px', display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
      <div style={{ flex: '1 1 400px', background: '#fff', padding: '30px', border: '1px solid #eee', borderRadius: '8px' }}>
        <h2>Demo Checkout</h2>
        <p style={{ marginTop: '8px', color: '#64748b', fontSize: '14px', lineHeight: 1.5 }}>Abhi demo mode active hai. Koi bhi fake card/name/phone details daloge to payment success hoga aur course enroll ho jayega.</p>
        <form onSubmit={handlePayment} style={{ marginTop: '20px' }}>
          {[{ label: 'Full Name', name: 'name' }, { label: 'Email', name: 'email' }, { label: 'Phone', name: 'phone' }].map((field) => <div key={field.name} style={{ marginBottom: '15px' }}><label style={{ display: 'block', marginBottom: '5px' }}>{field.label}</label><input name={field.name} value={form[field.name]} onChange={change} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} /></div>)}
          <div style={{ marginBottom: '15px' }}><label style={{ display: 'block', marginBottom: '5px' }}>Card Number</label><input name="cardNumber" value={form.cardNumber} onChange={change} placeholder="4242 4242 4242 4242" style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} /></div>
          <div style={{ display: 'flex', gap: '15px', marginBottom: '25px' }}><div style={{ flex: 1 }}><label style={{ display: 'block', marginBottom: '5px' }}>Expiry</label><input name="expiry" value={form.expiry} onChange={change} placeholder="12/30" style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} /></div><div style={{ flex: 1 }}><label style={{ display: 'block', marginBottom: '5px' }}>CVC</label><input name="cvc" value={form.cvc} onChange={change} placeholder="123" style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} /></div></div>
          <button type="submit" disabled={paying} style={{ width: '100%', background: '#28a745', color: '#fff', border: 'none', padding: '15px', fontSize: '16px', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer', opacity: paying ? 0.7 : 1 }}>{paying ? 'Completing demo payment...' : `Pay ${formatCurrency(course.price || 0, course.currency || 'INR')}`}</button>
        </form>
      </div>
      <div style={{ flex: '1 1 250px', background: '#f9f9f9', padding: '30px', border: '1px solid #eee', borderRadius: '8px', height: 'fit-content' }}><h3>Order Summary</h3><hr style={{ margin: '15px 0', border: '0', borderTop: '1px solid #ddd' }} /><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', gap: '14px' }}><span>{course.title}</span><strong>{formatCurrency(course.price || 0, course.currency || 'INR')}</strong></div><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: '#666' }}><span>Tax</span><span>{formatCurrency(0, course.currency || 'INR')}</span></div><hr style={{ margin: '15px 0', border: '0', borderTop: '1px solid #ddd' }} /><div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: 'bold' }}><span>Total</span><span>{formatCurrency(course.price || 0, course.currency || 'INR')}</span></div></div>
    </div>
  )
}

export default Checkout
