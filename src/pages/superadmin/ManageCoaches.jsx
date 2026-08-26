import { useEffect, useMemo, useState } from 'react'
import { Edit2, Plus, Search, Trash2, Users, X, Phone, Globe, MapPin, Building2, CheckCircle2, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api'
import { formatCurrency } from '../../utils/formatters'
import { confirmDialog, selectDialog } from '../../utils/dialogs'
import { resolveMediaUrl } from '../../utils/media'
import LocationSelector from '../../components/common/LocationSelector'

const emptyCoachForm = {
  name: '',
  email: '',
  password: 'password123',
  title: 'Course Coach',
  status: 'active',
  phone: '',
  country: 'India',
  state: '',
  city: '',
  address: '',
  zip: '',
  expertise: '',
  bio: '',
}

export default function ManageCoaches() {
  const [rows, setRows] = useState([])
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyCoachForm)

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get('/admin/coaches')
      setRows(res.coaches || [])
    } catch (err) {
      toast.error(err?.message || 'Failed to load coaches')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(() => {
    return rows.filter((r) =>
      `${r.name} ${r.email} ${r.profile?.city || ''} ${r.profile?.state || ''} ${r.profile?.country || ''} ${r.profile?.expertise || ''}`
        .toLowerCase()
        .includes(q.toLowerCase())
    )
  }, [rows, q])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyCoachForm)
    setShowForm(true)
  }

  const openEdit = (coach) => {
    setEditing(coach)
    setShowForm(true)
    setForm({
      name: coach.name || '',
      email: coach.email || '',
      password: '',
      title: coach.title || 'Course Coach',
      status: coach.status || 'active',
      phone: coach.profile?.phone || '',
      country: coach.profile?.country || 'India',
      state: coach.profile?.state || '',
      city: coach.profile?.city || '',
      address: coach.profile?.addressLine1 || '',
      zip: coach.profile?.pincode || '',
      expertise: coach.profile?.expertise || '',
      bio: coach.profile?.bio || '',
    })
  }

  const closeForm = () => {
    setShowForm(false)
    setEditing(null)
    setForm(emptyCoachForm)
  }

  const change = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }))

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
      return toast.error('Name and email are required')
    }
    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        title: form.title,
        status: form.status,
        profile: {
          phone: form.phone,
          country: form.country,
          state: form.state,
          city: form.city,
          addressLine1: form.address,
          pincode: form.zip,
          expertise: form.expertise,
          bio: form.bio,
        },
        ...(form.password ? { password: form.password } : {}),
      }

      if (editing) {
        await api.put(`/admin/coaches/${editing.id}`, payload)
      } else {
        await api.post('/admin/coaches', payload)
      }
      toast.success(editing ? 'Coach updated' : 'Coach created')
      closeForm()
      await load()
    } catch (err) {
      toast.error(err?.message || 'Failed to save coach')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (coach) => {
    const hasSoldCourses =
      Number(coach.stats?.students || 0) > 0 || Number(coach.stats?.revenue || 0) > 0
    const transferOptions = rows.filter(
      (row) => row.id !== coach.id && row.status === 'active'
    )
    let transferToCoachId = null

    if (hasSoldCourses) {
      if (!transferOptions.length) {
        toast.error(
          'This coach has sold courses. Create another active coach first, then transfer courses before deleting.'
        )
        return
      }

      transferToCoachId = await selectDialog({
        title: 'Transfer coach courses',
        message: `${coach.name}'s courses, students, and revenue must be assigned to another active coach before deletion.`,
        options: transferOptions.map((item) => ({
          value: item.id,
          label: item.name,
          description: item.email,
        })),
      })
      if (!transferToCoachId) return

      const target = transferOptions.find((item) => item.id === transferToCoachId)
      const confirmed = await confirmDialog({
        title: 'Delete coach after transfer?',
        message: `${coach.name}'s courses, students, and revenue will be assigned to ${
          target?.name || 'the selected coach'
        }.`,
        confirmText: 'Transfer and Delete',
        tone: 'danger',
      })
      if (!confirmed) return
    } else {
      const ok = await confirmDialog({
        title: 'Delete coach?',
        message: `${coach.name} will be deleted. Unsold courses linked to this coach will also be removed.`,
        confirmText: 'Delete Coach',
        tone: 'danger',
      })
      if (!ok) return
    }

    try {
      const res = await api.delete(`/admin/coaches/${coach.id}`, {
        data: transferToCoachId ? { transferToCoachId } : {},
      })
      toast.success(
        res.transferred
          ? `Coach deleted. Courses assigned to ${res.transferToCoachName}.`
          : 'Coach deleted'
      )
      await load()
    } catch (err) {
      if (err?.details?.transferRequired && err.details.availableCoaches?.length) {
        toast.error('Select a transfer coach before deleting')
      } else if (err?.details?.transferRequired) {
        toast.error(
          'This coach has sold courses and no other active coach is available for transfer.'
        )
      } else {
        toast.error(err?.message || 'Failed to delete coach')
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <Users size={24} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">Manage Coaches</h1>
            <p className="text-xs text-slate-500">
              Create, edit, and oversee instructors with dynamic location details
            </p>
          </div>
        </div>

        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700"
        >
          <Plus size={14} /> Add Coach
        </button>
      </div>

      {/* Form Modal / Section */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  {editing ? 'Edit Coach Profile' : 'Add New Coach'}
                </h3>
                <p className="text-xs text-slate-500">
                  Provide coach credentials, specialization, and dynamic location details
                </p>
              </div>
              <button onClick={closeForm} className="text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={save} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Coach Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    name="name"
                    required
                    placeholder="e.g. Dr. Meera Patel"
                    value={form.name}
                    onChange={change}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-indigo-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="coach@example.com"
                    value={form.email}
                    onChange={change}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-indigo-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    {editing ? 'New Password (Optional)' : 'Password'}
                  </label>
                  <input
                    name="password"
                    type="password"
                    placeholder={editing ? 'Keep existing' : 'password123'}
                    value={form.password}
                    onChange={change}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-indigo-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Title</label>
                  <input
                    name="title"
                    placeholder="e.g. Senior Instructor"
                    value={form.title}
                    onChange={change}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-indigo-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Status</label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={change}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-indigo-600 focus:outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="blocked">Blocked</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Phone Number</label>
                  <input
                    name="phone"
                    placeholder="+91 98765 43210"
                    value={form.phone}
                    onChange={change}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-indigo-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Specialization / Expertise</label>
                  <input
                    name="expertise"
                    placeholder="e.g. Full Stack Web Development"
                    value={form.expertise}
                    onChange={change}
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
                    name="address"
                    placeholder="Street / Office Address"
                    value={form.address}
                    onChange={change}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-indigo-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Pincode / ZIP</label>
                  <input
                    name="zip"
                    placeholder="e.g. 560001"
                    value={form.zip}
                    onChange={change}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-indigo-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60"
                >
                  {saving ? 'Saving...' : editing ? 'Update Coach' : 'Create Coach'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="text-xs font-bold text-slate-700">
          Total Coaches: <span className="text-indigo-600">{filtered.length}</span>
        </div>

        <div className="relative w-72">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={15} />
          <input
            type="text"
            placeholder="Search by name, email, city, expertise..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full rounded-lg border border-slate-300 py-1.5 pl-9 pr-3 text-xs focus:border-indigo-600 focus:outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3">Coach</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Location</th>
                <th className="px-5 py-3">Courses</th>
                <th className="px-5 py-3">Students</th>
                <th className="px-5 py-3">Revenue</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                    <p className="mt-2 text-xs font-semibold">Loading coaches...</p>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Users className="mx-auto mb-2 text-slate-300" size={32} />
                    <p className="text-xs font-bold text-slate-700">No coaches found</p>
                  </td>
                </tr>
              ) : (
                filtered.map((coach) => (
                  <tr key={coach.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-5 py-3.5 font-semibold text-slate-900">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-indigo-50 font-bold text-indigo-600">
                          {resolveMediaUrl(coach.avatar) ? (
                            <img
                              src={resolveMediaUrl(coach.avatar)}
                              alt={coach.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            (coach.name || 'C')[0]?.toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{coach.name}</p>
                          <p className="text-[10px] text-slate-400">{coach.title || 'Coach'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{coach.email}</td>
                    <td className="px-5 py-3.5 text-slate-700 font-medium">
                      {coach.profile?.city || coach.profile?.state || coach.profile?.country ? (
                        <span>
                          {[coach.profile?.city, coach.profile?.state, coach.profile?.country]
                            .filter(Boolean)
                            .join(', ')}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-slate-700 font-semibold">{coach.stats?.courses ?? 0}</td>
                    <td className="px-5 py-3.5 text-slate-700 font-semibold">{coach.stats?.students ?? 0}</td>
                    <td className="px-5 py-3.5 font-bold text-slate-900">{formatCurrency(coach.stats?.revenue ?? 0)}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          coach.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {coach.status === 'active' ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                        {coach.status || 'active'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(coach)}
                          className="rounded p-1.5 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600"
                          title="Edit coach"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => remove(coach)}
                          className="rounded p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                          title="Delete coach"
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
    </div>
  )
}