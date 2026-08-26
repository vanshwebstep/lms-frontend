import { useEffect, useMemo, useState } from 'react'
import {
  Edit2,
  Plus,
  Search,
  Trash2,
  Users,
  X,
  Phone,
  Mail,
  MapPin,
  Globe,
  Building2,
  CheckCircle2,
  XCircle,
  UserPlus,
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api'
import { resolveMediaUrl } from '../../utils/media'
import LocationSelector from '../../components/common/LocationSelector'

const emptyStudentForm = {
  name: '',
  email: '',
  password: 'password123',
  status: 'active',
  phone: '',
  country: 'India',
  state: '',
  city: '',
  address: '',
  zip: '',
  bio: '',
}

export default function ManageStudents() {
  const [rows, setRows] = useState([])
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingStudent, setEditingStudent] = useState(null)
  const [form, setForm] = useState(emptyStudentForm)

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get('/admin/students')
      setRows(res.students || [])
    } catch (err) {
      toast.error(err?.message || 'Failed to load students')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(() => {
    return rows.filter((r) =>
      `${r.name} ${r.email} ${r.profile?.city || ''} ${r.profile?.state || ''} ${r.profile?.country || ''}`
        .toLowerCase()
        .includes(q.toLowerCase())
    )
  }, [rows, q])

  const openCreate = () => {
    setEditingStudent(null)
    setForm(emptyStudentForm)
    setShowModal(true)
  }

  const openEdit = (student) => {
    setEditingStudent(student)
    setForm({
      name: student.name || '',
      email: student.email || '',
      password: '',
      status: student.status || 'active',
      phone: student.profile?.phone || '',
      country: student.profile?.country || 'India',
      state: student.profile?.state || '',
      city: student.profile?.city || '',
      address: student.profile?.addressLine1 || '',
      zip: student.profile?.pincode || '',
      bio: student.profile?.bio || '',
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingStudent(null)
    setForm(emptyStudentForm)
  }

  const handleLocationChange = ({ country, state, city }) => {
    setForm((prev) => ({
      ...prev,
      country,
      state,
      city,
    }))
  }

  const save = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim()) {
      return toast.error('Student name and email are required')
    }
    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        status: form.status,
        phone: form.phone.trim(),
        country: form.country,
        state: form.state,
        city: form.city,
        addressLine1: form.address,
        pincode: form.zip,
        bio: form.bio,
        ...(form.password ? { password: form.password } : {}),
      }

      if (editingStudent) {
        await api.put(`/admin/students/${editingStudent.id}`, payload)
        toast.success('Student updated successfully')
      } else {
        await api.post('/admin/students', payload)
        toast.success('Student created and registered successfully')
      }
      closeModal()
      await load()
    } catch (err) {
      toast.error(err?.message || 'Failed to save student')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (student) => {
    if (!window.confirm(`Are you sure you want to delete student "${student.name}"? This action cannot be undone.`)) {
      return
    }
    try {
      await api.delete(`/admin/students/${student.id}`)
      toast.success('Student deleted successfully')
      await load()
    } catch (err) {
      toast.error(err?.message || 'Failed to delete student')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <Users size={24} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">Manage Students</h1>
            <p className="text-xs text-slate-500">
              View, register, edit, and manage all enrolled students with dynamic location details
            </p>
          </div>
        </div>

        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700"
        >
          <UserPlus size={14} /> Add New Student
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="text-xs font-bold text-slate-700">
          Total Students: <span className="text-indigo-600">{filtered.length}</span>
        </div>

        <div className="relative w-72">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={15} />
          <input
            type="text"
            placeholder="Search by name, email, city, state..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full rounded-lg border border-slate-300 py-1.5 pl-9 pr-3 text-xs focus:border-indigo-600 focus:outline-none"
          />
        </div>
      </div>

      {/* Students Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3">Student Name</th>
                <th className="px-5 py-3">Email Address</th>
                <th className="px-5 py-3">Phone</th>
                <th className="px-5 py-3">Location (City, State, Country)</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                    <p className="mt-2 text-xs font-semibold">Loading students...</p>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Users className="mx-auto mb-2 text-slate-300" size={32} />
                    <p className="text-xs font-bold text-slate-700">No students found</p>
                    <p className="text-[11px] text-slate-400">Click "Add New Student" to create a record.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-5 py-3.5 font-semibold text-slate-900">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-indigo-50 font-bold text-indigo-600">
                          {resolveMediaUrl(s.avatar) ? (
                            <img src={resolveMediaUrl(s.avatar)} alt={s.name} className="h-full w-full object-cover" />
                          ) : (
                            (s.name || 'S')[0]?.toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{s.name}</p>
                          <p className="text-[10px] text-slate-400">ID: {s.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{s.email}</td>
                    <td className="px-5 py-3.5 text-slate-600">{s.profile?.phone || '-'}</td>
                    <td className="px-5 py-3.5 text-slate-700 font-medium">
                      {s.profile?.city || s.profile?.state || s.profile?.country ? (
                        <span>
                          {[s.profile?.city, s.profile?.state, s.profile?.country].filter(Boolean).join(', ')}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          s.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {s.status === 'active' ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                        {s.status || 'active'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(s)}
                          className="rounded p-1.5 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600"
                          title="Edit Student"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => remove(s)}
                          className="rounded p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                          title="Delete Student"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Student Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  {editingStudent ? 'Edit Student Details' : 'Add New Student'}
                </h3>
                <p className="text-xs text-slate-500">
                  Fill in the student's personal, contact, and dynamic location details
                </p>
              </div>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={save} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aryan Gupta"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-indigo-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="student@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-indigo-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-indigo-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    {editingStudent ? 'Change Password (Optional)' : 'Password'}
                  </label>
                  <input
                    type="password"
                    placeholder={editingStudent ? 'Leave blank to keep current' : 'password123'}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-indigo-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Dynamic Cascading Country, State, City */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                <h4 className="mb-3 text-xs font-extrabold uppercase tracking-wider text-slate-600">
                  Dynamic Location Details
                </h4>
                <LocationSelector
                  country={form.country}
                  state={form.state}
                  city={form.city}
                  onChange={handleLocationChange}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Address Line</label>
                  <input
                    type="text"
                    placeholder="Street / Flat / House No."
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-indigo-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Pincode / ZIP</label>
                  <input
                    type="text"
                    placeholder="e.g. 110001"
                    value={form.zip}
                    onChange={(e) => setForm({ ...form, zip: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-indigo-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Account Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-indigo-600 focus:outline-none"
                >
                  <option value="active">Active</option>
                  <option value="blocked">Blocked / Suspended</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60"
                >
                  {saving ? 'Saving...' : editingStudent ? 'Update Student' : 'Create Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}