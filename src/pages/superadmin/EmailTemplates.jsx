import { useState, useEffect } from 'react'
import {
  Mail,
  Plus,
  Search,
  Settings,
  Eye,
  Edit,
  Trash2,
  Send,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowLeft,
  X,
  Server,
  RefreshCw,
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api'
import EmailBuilder from '../../components/email/EmailBuilder'

export default function EmailTemplates() {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeModule, setActiveModule] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [smtpModal, setSmtpModal] = useState(false)
  const [newTemplateModal, setNewTemplateModal] = useState(false)

  const [smtpConfig, setSmtpConfig] = useState({
    smtp_host: 'smtp.gmail.com',
    smtp_port: 465,
    smtp_secure: true,
    smtp_username: 'kapilakshu848@gmail.com',
    smtp_password: '',
    from_email: 'kapilakshu848@gmail.com',
    from_name: 'LearnFlow',
  })

  const [newTemplateData, setNewTemplateData] = useState({
    module: 'student',
    action: '',
    subject: '',
    variables: ['name', 'appName', 'loginUrl'],
  })

  const fetchTemplates = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/email-templates?module=${activeModule}`)
      setTemplates(res.templates || [])
      if (res.templates && res.templates.length > 0) {
        const first = res.templates[0]
        setSmtpConfig({
          smtp_host: first.smtp_host || 'smtp.gmail.com',
          smtp_port: first.smtp_port || 465,
          smtp_secure: Boolean(first.smtp_secure),
          smtp_username: first.smtp_username || '',
          smtp_password: first.smtp_password || '',
          from_email: first.from_email || '',
          from_name: first.from_name || 'LearnFlow',
        })
      }
    } catch (err) {
      toast.error(err?.message || 'Failed to load email templates')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTemplates()
  }, [activeModule])

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
      toast.success('Email template saved successfully')
      setIsEditing(false)
      fetchTemplates()
    } catch (err) {
      toast.error(err?.message || 'Failed to save email template')
    } finally {
      setIsSaving(false)
    }
  }

  const handleTestSend = async (toEmail) => {
    if (!selectedTemplate) return
    await api.post(`/email-templates/${selectedTemplate.id}/test-send`, {
      to: toEmail,
    })
  }

  const handleToggleStatus = async (tmpl) => {
    try {
      const newStatus = tmpl.status === 1 ? 0 : 1
      await api.put(`/email-templates/${tmpl.id}`, { status: newStatus })
      setTemplates((prev) =>
        prev.map((t) => (t.id === tmpl.id ? { ...t, status: newStatus } : t))
      )
      toast.success(`Template ${newStatus === 1 ? 'Enabled' : 'Disabled'}`)
    } catch (err) {
      toast.error(err?.message || 'Failed to update template status')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this email template?')) return
    try {
      await api.delete(`/email-templates/${id}`)
      toast.success('Email template deleted')
      fetchTemplates()
    } catch (err) {
      toast.error(err?.message || 'Failed to delete template')
    }
  }

  const handleSaveSmtp = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      // Update all templates with new SMTP settings
      await Promise.all(
        templates.map((t) =>
          api.put(`/email-templates/${t.id}`, {
            smtp_host: smtpConfig.smtp_host,
            smtp_port: Number(smtpConfig.smtp_port),
            smtp_secure: smtpConfig.smtp_secure,
            smtp_username: smtpConfig.smtp_username,
            smtp_password: smtpConfig.smtp_password,
            from_email: smtpConfig.from_email,
            from_name: smtpConfig.from_name,
          })
        )
      )
      toast.success('SMTP Configuration applied to all templates')
      setSmtpModal(false)
      fetchTemplates()
    } catch (err) {
      toast.error(err?.message || 'Failed to update SMTP settings')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCreateNewTemplate = async (e) => {
    e.preventDefault()
    if (!newTemplateData.action || !newTemplateData.subject) {
      return toast.error('Action identifier and subject are required')
    }
    try {
      const res = await api.post('/email-templates', newTemplateData)
      toast.success('New email template created')
      setNewTemplateModal(false)
      fetchTemplates()
      if (res?.template) {
        handleEdit(res.template)
      }
    } catch (err) {
      toast.error(err?.message || 'Failed to create email template')
    }
  }

  const filteredTemplates = templates.filter((t) => {
    const matchesSearch =
      (t.subject || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.action || '').toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  // If editing a template in full builder
  if (isEditing && selectedTemplate) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col bg-white overflow-hidden">
        <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-6 py-2 text-xs font-bold text-slate-600">
          <button
            onClick={() => setIsEditing(false)}
            className="flex items-center gap-1 text-slate-700 hover:text-indigo-600"
          >
            <ArrowLeft size={14} /> Back to Templates List
          </button>
          <span>/</span>
          <span className="capitalize">{selectedTemplate.module} Module</span>
          <span>/</span>
          <span className="font-mono text-indigo-600">{selectedTemplate.action}</span>
        </div>
        <div className="flex-1 overflow-hidden">
          <EmailBuilder
            title={`Edit Template: ${selectedTemplate.action}`}
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
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <Mail size={24} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">Email Templates & Automation</h1>
            <p className="text-xs text-slate-500">
              Design, customize, and test automated emails with visual drag & drop builder
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* <button
            onClick={() => setSmtpModal(true)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            <Server size={14} /> SMTP Settings
          </button> */}
          <button
            onClick={() => setNewTemplateModal(true)}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700"
          >
            <Plus size={14} /> Create Template
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: 'all', label: 'All Modules' },
            { id: 'student', label: 'Student Emails' },
            { id: 'coach', label: 'Coach Emails' },
            { id: 'admin', label: 'Admin Notifications' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveModule(tab.id)}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${activeModule === tab.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
            >
              {tab.label}
            </button>
          ))}
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
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="mt-3 text-xs font-semibold">Loading templates...</p>
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <Mail className="mx-auto text-slate-300" size={40} />
          <h3 className="mt-3 text-sm font-bold text-slate-800">No Email Templates Found</h3>
          <p className="mt-1 text-xs text-slate-500">Create a new template to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredTemplates.map((tmpl) => (
            <div
              key={tmpl.id}
              className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-300 hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${tmpl.module === 'student'
                          ? 'bg-emerald-50 text-emerald-700'
                          : tmpl.module === 'coach'
                            ? 'bg-sky-50 text-sky-700'
                            : 'bg-purple-50 text-purple-700'
                        }`}
                    >
                      {tmpl.module}
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-700">{tmpl.action}</span>
                  </div>

                  <button
                    onClick={() => handleToggleStatus(tmpl)}
                    className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${tmpl.status === 1
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                  >
                    {tmpl.status === 1 ? (
                      <>
                        <CheckCircle2 size={11} /> Active
                      </>
                    ) : (
                      <>
                        <XCircle size={11} /> Disabled
                      </>
                    )}
                  </button>
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
                  className="flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-600 hover:bg-indigo-100"
                >
                  <Edit size={13} /> Visual Builder
                </button>

                <div className="flex items-center gap-1">
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
                  <button
                    onClick={() => handleDelete(tmpl.id)}
                    title="Delete Template"
                    className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SMTP Configuration Drawer / Modal */}
      {smtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Server className="text-indigo-600" size={20} />
                <h3 className="text-base font-bold text-slate-900">Platform SMTP Server Settings</h3>
              </div>
              <button
                onClick={() => setSmtpModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveSmtp} className="mt-4 space-y-3.5">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="mb-1 block text-xs font-semibold text-slate-600">SMTP Host</label>
                  <input
                    type="text"
                    required
                    value={smtpConfig.smtp_host}
                    onChange={(e) => setSmtpConfig({ ...smtpConfig, smtp_host: e.target.value })}
                    className="w-full rounded border border-slate-300 p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">Port</label>
                  <input
                    type="number"
                    required
                    value={smtpConfig.smtp_port}
                    onChange={(e) => setSmtpConfig({ ...smtpConfig, smtp_port: e.target.value })}
                    className="w-full rounded border border-slate-300 p-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">SMTP Username / Email</label>
                <input
                  type="text"
                  required
                  value={smtpConfig.smtp_username}
                  onChange={(e) => setSmtpConfig({ ...smtpConfig, smtp_username: e.target.value })}
                  className="w-full rounded border border-slate-300 p-2 text-xs"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">SMTP Password / App Key</label>
                <input
                  type="password"
                  value={smtpConfig.smtp_password}
                  onChange={(e) => setSmtpConfig({ ...smtpConfig, smtp_password: e.target.value })}
                  placeholder="Enter SMTP App Password"
                  className="w-full rounded border border-slate-300 p-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">Sender Name</label>
                  <input
                    type="text"
                    value={smtpConfig.from_name}
                    onChange={(e) => setSmtpConfig({ ...smtpConfig, from_name: e.target.value })}
                    className="w-full rounded border border-slate-300 p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">Sender Email</label>
                  <input
                    type="email"
                    value={smtpConfig.from_email}
                    onChange={(e) => setSmtpConfig({ ...smtpConfig, from_email: e.target.value })}
                    className="w-full rounded border border-slate-300 p-2 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="smtp_secure"
                  checked={smtpConfig.smtp_secure}
                  onChange={(e) => setSmtpConfig({ ...smtpConfig, smtp_secure: e.target.checked })}
                  className="rounded text-indigo-600"
                />
                <label htmlFor="smtp_secure" className="text-xs font-semibold text-slate-700">
                  Enable SSL / TLS Secure Connection (Port 465)
                </label>
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setSmtpModal(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-60"
                >
                  {isSaving ? 'Saving...' : 'Apply SMTP Settings'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create New Template Modal */}
      {newTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Create New Email Template</h3>
              <button
                onClick={() => setNewTemplateModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateNewTemplate} className="mt-4 space-y-3.5">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Module</label>
                <select
                  value={newTemplateData.module}
                  onChange={(e) => setNewTemplateData({ ...newTemplateData, module: e.target.value })}
                  className="w-full rounded border border-slate-300 p-2 text-xs"
                >
                  <option value="student">Student</option>
                  <option value="coach">Coach</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Action Identifier (e.g. course-update)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. course-update"
                  value={newTemplateData.action}
                  onChange={(e) => setNewTemplateData({ ...newTemplateData, action: e.target.value })}
                  className="w-full rounded border border-slate-300 p-2 text-xs font-mono"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Email Subject</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Important update regarding {{courseName}}"
                  value={newTemplateData.subject}
                  onChange={(e) => setNewTemplateData({ ...newTemplateData, subject: e.target.value })}
                  className="w-full rounded border border-slate-300 p-2 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setNewTemplateModal(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700"
                >
                  Create & Launch Builder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
