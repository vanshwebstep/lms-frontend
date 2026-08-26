import { useState, useEffect } from 'react'
import {
  Mail,
  Search,
  Eye,
  Edit,
  Send,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  BookOpen,
  RotateCcw,
  UserCheck,
  Globe,
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api'
import EmailBuilder from '../../components/email/EmailBuilder'

export default function CoachEmailTemplates() {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const fetchTemplates = async () => {
    setLoading(true)
    try {
      // Fetch coach and student learning templates scoped to coach
      const res = await api.get('/email-templates')
      setTemplates(res.templates || [])
    } catch (err) {
      toast.error(err?.message || 'Failed to load email templates')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTemplates()
  }, [])

  const handleEdit = (tmpl) => {
    setSelectedTemplate(tmpl)
    setIsEditing(true)
  }

  const handleSaveTemplate = async ({ subject, html_template }) => {
    if (!selectedTemplate) return
    setIsSaving(true)
    try {
      await api.put(`/email-templates/${selectedTemplate.id}`, {
        subject,
        html_template,
      })
      toast.success('Your personalized template saved! (Admin default unchanged)')
      setIsEditing(false)
      fetchTemplates()
    } catch (err) {
      toast.error(err?.message || 'Failed to save email template')
    } finally {
      setIsSaving(false)
    }
  }

  const handleResetToDefault = async (tmpl) => {
    if (!window.confirm('Revert this template back to the Admin Global Default template?')) return
    try {
      await api.post(`/email-templates/${tmpl.id}/reset`)
      toast.success('Reverted to Admin Global Default template')
      if (isEditing) setIsEditing(false)
      fetchTemplates()
    } catch (err) {
      toast.error(err?.message || 'Failed to reset template')
    }
  }

  const handleTestSend = async (toEmail, draftData = {}) => {
    if (!selectedTemplate) return
    await api.post(`/email-templates/${selectedTemplate.id}/test-send`, {
      to: toEmail,
      subject: draftData.subject,
      html_template: draftData.html_template,
    })
  }

  const filteredTemplates = templates.filter((t) => {
    const matchesSearch =
      (t.subject || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.action || '').toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  // Full visual builder view
  if (isEditing && selectedTemplate) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col bg-white overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-2 text-xs font-bold text-slate-600">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(false)}
              className="flex items-center gap-1 text-slate-700 hover:text-indigo-600"
            >
              <ArrowLeft size={14} /> Back to Coach Email Templates
            </button>
            <span>/</span>
            <span className="font-mono text-indigo-600">{selectedTemplate.action}</span>
            {selectedTemplate.isCustom ? (
              <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] text-emerald-800 font-bold">
                Customized by You
              </span>
            ) : (
              <span className="rounded bg-slate-200 px-2 py-0.5 text-[10px] text-slate-700 font-bold">
                Using Admin Default
              </span>
            )}
          </div>

          {selectedTemplate.isCustom && (
            <button
              onClick={() => handleResetToDefault(selectedTemplate)}
              className="flex items-center gap-1 text-slate-600 hover:text-red-600 text-xs font-bold"
            >
              <RotateCcw size={13} /> Revert to Admin Default
            </button>
          )}
        </div>

        <div className="flex-1 overflow-hidden">
          <EmailBuilder
            title={`Customize Student Email: ${selectedTemplate.action}`}
            action={selectedTemplate.action}
            initialSubject={selectedTemplate.subject}
            initialHtml={selectedTemplate.html_template}
            initialVariables={selectedTemplate.variables || []}
            onSave={handleSaveTemplate}
            onTestSend={handleTestSend}
            isSaving={isSaving}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
            <Mail size={24} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">Student Email Studio</h1>
            <p className="text-xs text-slate-500">
              Customize automated emails sent to your students. By default, emails use the Admin template unless you customize them.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700">
            <Globe size={13} className="text-slate-500" /> Admin Default Fallback
          </div>
          <div className="rounded-lg bg-sky-50 px-3 py-1.5 text-xs font-bold text-sky-700">
            Visual Builder
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="text-xs font-bold text-slate-700">
          Available Student Notification Templates ({filteredTemplates.length})
        </div>

        <div className="relative w-72">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={15} />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-300 py-1.5 pl-9 pr-3 text-xs focus:border-indigo-600 focus:outline-none"
          />
        </div>
      </div>

      {/* Templates Grid */}
      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-500">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-sky-600 border-t-transparent" />
          <p className="mt-3 text-xs font-semibold">Loading your email templates...</p>
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <Mail className="mx-auto text-slate-300" size={40} />
          <h3 className="mt-3 text-sm font-bold text-slate-800">No Email Templates Found</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredTemplates.map((tmpl) => (
            <div
              key={tmpl.id}
              className={`flex flex-col justify-between rounded-xl border p-5 shadow-sm transition hover:shadow-md ${
                tmpl.isCustom
                  ? 'border-emerald-300 bg-emerald-50/20 hover:border-emerald-400'
                  : 'border-slate-200 bg-white hover:border-sky-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="rounded bg-sky-50 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-sky-700">
                      {tmpl.module}
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-700">{tmpl.action}</span>
                  </div>

                  {tmpl.isCustom ? (
                    <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                      <UserCheck size={11} /> Customized
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                      <Globe size={11} /> Admin Default
                    </span>
                  )}
                </div>

                <div className="mt-3">
                  <h3 className="line-clamp-2 text-sm font-bold text-slate-900">{tmpl.subject}</h3>
                </div>

                <div className="mt-3 flex flex-wrap gap-1">
                  {(tmpl.variables || []).slice(0, 3).map((v) => (
                    <span
                      key={v}
                      className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-600"
                    >
                      {`{{${v}}}`}
                    </span>
                  ))}
                  {(tmpl.variables || []).length > 3 && (
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-400">
                      +{(tmpl.variables || []).length - 3} more
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3">
                <button
                  onClick={() => handleEdit(tmpl)}
                  className="flex items-center gap-1.5 rounded-lg bg-sky-50 px-3 py-1.5 text-xs font-bold text-sky-700 hover:bg-sky-100"
                >
                  <Edit size={13} /> {tmpl.isCustom ? 'Edit Your Design' : 'Customize Design'}
                </button>

                <div className="flex items-center gap-1">
                  {tmpl.isCustom && (
                    <button
                      onClick={() => handleResetToDefault(tmpl)}
                      title="Revert to Admin Default"
                      className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <RotateCcw size={14} />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setSelectedTemplate(tmpl)
                      setIsEditing(true)
                    }}
                    title="Preview"
                    className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  >
                    <Eye size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
