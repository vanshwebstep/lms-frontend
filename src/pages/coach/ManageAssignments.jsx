import { useEffect, useMemo, useState } from "react";
import { CheckCircle, ClipboardList, Clock, Download, Edit2, Eye, Filter, MessageSquare, Paperclip, Plus, Search, Trash2, Upload, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";
import { confirmDialog } from "../../utils/dialogs";
import { formatDate } from "../../utils/formatters";
import { resolveMediaUrl } from "../../utils/media";

const emptyAssignment = {
  title: "",
  courseId: "",
  dueAt: "",
  description: "",
  maxScore: "100",
  status: "published",
  attachmentUrl: "",
  attachmentName: "",
};

const dateInputValue = (value) => (value ? String(value).slice(0, 10) : "");

const submissionStatusMeta = (status) => {
  if (status === "graded") return { label: "Accepted", icon: CheckCircle, className: "bg-green-100 text-green-600" };
  if (status === "pending") return { label: "Rejected", icon: XCircle, className: "bg-red-100 text-red-500" };
  return { label: "Submitted", icon: Clock, className: "bg-yellow-100 text-yellow-600" };
};

export default function ManageAssignments() {
  const [tab, setTab] = useState("assignments");
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("All Courses");
  const [modal, setModal] = useState({ mode: null, assignment: null });
  const [reviewSubmission, setReviewSubmission] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      const [assignmentRes, courseRes] = await Promise.all([api.get("/coach/assignments"), api.get("/coach/courses")]);
      setAssignments(assignmentRes.assignments || []);
      setSubmissions(assignmentRes.submissions || []);
      setCourses(courseRes.courses || []);
      setError("");
    } catch (err) {
      setError(err?.message || "Failed to load assignments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { const timer = setTimeout(load, 0); return () => clearTimeout(timer); }, []);

  const courseOptions = useMemo(() => ["All Courses", ...new Set(courses.map((c) => c.title).filter(Boolean))], [courses]);
  const filtered = assignments.filter((a) => {
    const q = search.toLowerCase();
    const matchSearch = `${a.title || ""} ${a.description || ""} ${a.attachmentName || ""}`.toLowerCase().includes(q);
    const matchCourse = courseFilter === "All Courses" || a.course?.title === courseFilter;
    return matchSearch && matchCourse;
  });

  const openCreate = () => setModal({ mode: "create", assignment: null });
  const openView = (assignment) => setModal({ mode: "view", assignment });
  const openEdit = (assignment) => setModal({ mode: "edit", assignment });
  const closeModal = () => setModal({ mode: null, assignment: null });

  const deleteAssignment = async (id) => {
    const ok = await confirmDialog({ title: "Delete assignment?", message: "This assignment will be removed for students.", confirmText: "Delete Assignment", tone: "danger" });
    if (!ok) return;
    try {
      await api.delete(`/coach/assignments/${id}`);
      toast.success("Assignment deleted");
      load();
    } catch (err) {
      toast.error(err?.message || "Delete failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold text-gray-800">Assignments</h2><p className="mt-1 text-sm text-gray-500">Create questions, attach files, and review submissions</p></div>
        <button onClick={openCreate} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700"><Plus size={18} /> New Assignment</button>
      </div>
      <div className="flex w-fit gap-1 rounded-xl bg-gray-100 p-1">{["assignments", "submissions"].map((t) => <button key={t} onClick={() => setTab(t)} className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition-colors ${tab === t ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>{t}</button>)}</div>
      <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-white p-4 shadow-sm"><div className="relative min-w-[200px] flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="text" placeholder="Search assignments..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-lg border py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" /></div><div className="flex items-center gap-2"><Filter size={16} className="text-gray-400" /><select value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)} className="rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">{courseOptions.map((c) => <option key={c}>{c}</option>)}</select></div></div>
      {error && <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

      {tab === "assignments" && <div className="overflow-hidden rounded-2xl bg-white shadow-sm"><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="border-b bg-gray-50"><tr>{["Assignment", "Course", "Attachment", "Due Date", "Submissions", "Status", "Actions"].map((h) => <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{h}</th>)}</tr></thead><tbody className="divide-y divide-gray-100">{loading ? <tr><td colSpan={7} className="px-5 py-10 text-center text-gray-400">Loading assignments...</td></tr> : filtered.length === 0 ? <tr><td colSpan={7} className="px-5 py-10 text-center text-gray-400">No assignments found</td></tr> : filtered.map((a) => {
        const attachmentUrl = resolveMediaUrl(a.attachmentUrl);
        return <tr key={a.id} className="transition-colors hover:bg-gray-50"><td className="px-5 py-3"><div className="flex items-center gap-2"><ClipboardList size={16} className="flex-shrink-0 text-indigo-400" /><span className="font-medium text-gray-800">{a.title}</span></div></td><td className="px-5 py-3"><span className="rounded-full bg-indigo-50 px-2 py-1 text-xs text-indigo-600">{a.course?.title || "-"}</span></td><td className="px-5 py-3">{attachmentUrl ? <a href={attachmentUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600"><Paperclip size={13} /> {a.attachmentName || "Open file"}</a> : <span className="text-xs text-gray-400">-</span>}</td><td className="px-5 py-3 text-xs text-gray-500">{a.dueAt ? formatDate(a.dueAt) : "-"}</td><td className="px-5 py-3"><div className="flex items-center gap-2"><div className="h-1.5 w-20 rounded-full bg-gray-200"><div className="h-1.5 rounded-full bg-indigo-500" style={{ width: `${a.total ? (a.submissions / a.total) * 100 : 0}%` }} /></div><span className="text-xs text-gray-500">{a.submissions}/{a.total}</span></div></td><td className="px-5 py-3"><span className={`rounded-full px-2 py-1 text-xs font-medium ${a.status === "published" ? "bg-green-100 text-green-600" : a.status === "archived" ? "bg-gray-100 text-gray-500" : "bg-yellow-100 text-yellow-600"}`}>{a.status}</span></td><td className="px-5 py-3"><div className="flex gap-1"><button onClick={() => openView(a)} className="rounded-lg p-1.5 hover:bg-indigo-50" title="View"><Eye size={14} className="text-indigo-500" /></button><button onClick={() => openEdit(a)} className="rounded-lg p-1.5 hover:bg-yellow-50" title="Edit"><Edit2 size={14} className="text-yellow-500" /></button><button onClick={() => deleteAssignment(a.id)} className="rounded-lg p-1.5 hover:bg-red-50" title="Delete"><Trash2 size={14} className="text-red-400" /></button></div></td></tr>;
      })}</tbody></table></div></div>}

      {tab === "submissions" && <SubmissionsTable submissions={submissions} loading={loading} onReview={setReviewSubmission} />}

      {reviewSubmission && <ReviewSubmissionModal submission={reviewSubmission} onClose={() => setReviewSubmission(null)} onSaved={() => { setReviewSubmission(null); load(); }} />}

      {modal.mode === "view" && <AssignmentViewModal assignment={modal.assignment} onClose={closeModal} />}
      {(modal.mode === "create" || modal.mode === "edit") && <AssignmentFormModal mode={modal.mode} assignment={modal.assignment} onClose={closeModal} courses={courses} onSaved={load} />}
    </div>
  );
}

function SubmissionsTable({ submissions, loading, onReview }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] text-sm">
          <thead className="border-b bg-gray-50">
            <tr>{["Student", "Assignment", "Submitted On", "Answer", "File", "Score", "Status", "Actions"].map((h) => <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? <tr><td colSpan={8} className="px-5 py-10 text-center text-gray-400">Loading submissions...</td></tr> : submissions.length === 0 ? <tr><td colSpan={8} className="px-5 py-10 text-center text-gray-400">No submissions yet</td></tr> : submissions.map((s) => {
              const fileUrl = resolveMediaUrl(s.file_url || s.fileUrl);
              const meta = submissionStatusMeta(s.status);
              const Icon = meta.icon;
              const maxScore = s.assignment_max_score ?? s.assignmentMaxScore;
              return <tr key={s.id} className="transition-colors hover:bg-gray-50">
                <td className="px-5 py-3"><div className="flex items-center gap-2"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600">{(s.student_name || "S")[0]}</div><div><p className="font-medium text-gray-800">{s.student_name}</p><p className="text-xs text-gray-400">{s.student_email}</p></div></div></td>
                <td className="px-5 py-3"><p className="text-xs font-semibold text-gray-700">{s.assignment_title}</p><p className="mt-1 text-xs text-gray-400">{s.course_title}</p></td>
                <td className="px-5 py-3 text-xs text-gray-500">{s.submitted_at ? formatDate(s.submitted_at) : "-"}</td>
                <td className="max-w-[240px] px-5 py-3 text-xs text-gray-600"><p className="max-h-10 overflow-hidden whitespace-pre-wrap">{s.answer_text || "-"}</p></td>
                <td className="px-5 py-3">{fileUrl ? <a href={fileUrl} target="_blank" rel="noreferrer" className="text-xs font-bold text-indigo-600">Open file</a> : <span className="text-xs text-gray-400">-</span>}</td>
                <td className="px-5 py-3"><span className={"font-bold " + (s.score !== null && s.score !== undefined ? "text-green-600" : "text-gray-400")}>{s.score ?? "-"}{maxScore ? <span className="text-gray-400">/{Number(maxScore)}</span> : null}</span></td>
                <td className="px-5 py-3"><span className={"flex w-fit items-center gap-1 rounded-full px-2 py-1 text-xs font-medium " + meta.className}><Icon size={11} />{meta.label}</span></td>
                <td className="px-5 py-3"><button onClick={() => onReview(s)} className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"><MessageSquare size={14} /> Review</button></td>
              </tr>;
            })}</tbody>
        </table>
      </div>
    </div>
  );
}

function ReviewSubmissionModal({ submission, onClose, onSaved }) {
  const maxScore = Number(submission.assignment_max_score ?? submission.assignmentMaxScore ?? 100);
  const [score, setScore] = useState(submission.score ?? maxScore);
  const [feedback, setFeedback] = useState(submission.feedback || "");
  const [saving, setSaving] = useState(false);
  const fileUrl = resolveMediaUrl(submission.file_url || submission.fileUrl);

  const submitReview = async (decision) => {
    if (decision === "accept" && (score === "" || Number.isNaN(Number(score)))) return toast.error("Score is required to accept");
    if (decision === "accept" && (Number(score) < 0 || Number(score) > maxScore)) return toast.error("Score must be between 0 and " + maxScore);
    if (decision === "reject" && !feedback.trim()) return toast.error("Feedback is required to reject");

    setSaving(true);
    try {
      await api.patch("/coach/assignments/submissions/" + submission.id + "/review", {
        decision,
        score: decision === "accept" ? Number(score) : null,
        feedback,
      });
      toast.success(decision === "accept" ? "Submission accepted" : "Submission rejected");
      onSaved();
    } catch (err) {
      toast.error(err?.message || "Review failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-auto rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div><h3 className="font-semibold text-gray-800">Review Submission</h3><p className="text-xs text-gray-400">{submission.student_name} - {submission.assignment_title}</p></div>
          <button onClick={onClose} className="text-xl text-gray-400 hover:text-gray-600">&times;</button>
        </div>
        <div className="space-y-4 p-6">
          <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            <div className="rounded-xl bg-gray-50 p-3"><p className="text-xs font-bold uppercase text-gray-400">Course</p><p className="mt-1 font-bold text-gray-800">{submission.course_title || "-"}</p></div>
            <div className="rounded-xl bg-gray-50 p-3"><p className="text-xs font-bold uppercase text-gray-400">Submitted</p><p className="mt-1 font-bold text-gray-800">{submission.submitted_at ? formatDate(submission.submitted_at) : "-"}</p></div>
          </div>
          <div><p className="text-xs font-bold uppercase text-gray-400">Student Answer</p><p className="mt-2 min-h-[90px] whitespace-pre-wrap rounded-xl border bg-gray-50 p-4 text-sm leading-6 text-gray-700">{submission.answer_text || "No written answer"}</p></div>
          {fileUrl && <a href={fileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-2 text-sm font-bold text-indigo-700"><Paperclip size={16} /> Open submitted file</a>}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[180px_1fr]">
            <div><label className="mb-1 block text-sm font-medium text-gray-700">Score</label><input type="number" min="0" max={maxScore} value={score} onChange={(e) => setScore(e.target.value)} className="w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" /><p className="mt-1 text-xs text-gray-400">Max score: {maxScore}</p></div>
            <div><label className="mb-1 block text-sm font-medium text-gray-700">Feedback</label><textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} rows={4} className="w-full resize-none rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" placeholder="Add feedback for the student" /></div>
          </div>
        </div>
        <div className="flex flex-col gap-3 border-t px-6 py-5 sm:flex-row">
          <button onClick={onClose} className="flex-1 rounded-xl border py-2.5 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={() => submitReview("reject")} disabled={saving} className="flex-1 rounded-xl bg-red-50 py-2.5 text-sm font-bold text-red-600 hover:bg-red-100 disabled:opacity-60">Reject</button>
          <button onClick={() => submitReview("accept")} disabled={saving} className="flex-1 rounded-xl bg-green-600 py-2.5 text-sm font-bold text-white hover:bg-green-700 disabled:opacity-60">Accept</button>
        </div>
      </div>
    </div>
  );
}

function AssignmentViewModal({ assignment, onClose }) {
  const fileUrl = resolveMediaUrl(assignment?.attachmentUrl);
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"><div className="w-full max-w-xl rounded-2xl bg-white shadow-xl"><div className="flex items-center justify-between border-b px-6 py-4"><h3 className="font-semibold text-gray-800">Assignment Details</h3><button onClick={onClose} className="text-xl text-gray-400 hover:text-gray-600">&times;</button></div><div className="space-y-4 p-6"><div><p className="text-xs font-bold uppercase text-gray-400">Title</p><h4 className="mt-1 text-xl font-black text-gray-900">{assignment?.title}</h4></div><div className="grid grid-cols-2 gap-3 text-sm"><div className="rounded-xl bg-gray-50 p-3"><p className="text-xs font-bold uppercase text-gray-400">Course</p><p className="mt-1 font-bold text-gray-800">{assignment?.course?.title || "-"}</p></div><div className="rounded-xl bg-gray-50 p-3"><p className="text-xs font-bold uppercase text-gray-400">Due</p><p className="mt-1 font-bold text-gray-800">{assignment?.dueAt ? formatDate(assignment.dueAt) : "-"}</p></div></div><div><p className="text-xs font-bold uppercase text-gray-400">Question / Instructions</p><p className="mt-2 whitespace-pre-wrap rounded-xl border bg-gray-50 p-4 text-sm leading-6 text-gray-700">{assignment?.description || "No instructions added"}</p></div>{fileUrl ? <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4"><p className="text-xs font-bold uppercase text-indigo-500">Attached File</p><div className="mt-3 flex flex-wrap gap-2"><a href={fileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-bold text-indigo-700"><Paperclip size={16} /> {assignment?.attachmentName || "View file"}</a><a href={fileUrl} download className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-bold text-white"><Download size={16} /> Download</a></div></div> : <div className="rounded-xl border border-dashed border-gray-200 p-4 text-sm text-gray-400">No attachment added</div>}</div><div className="px-6 pb-5"><button onClick={onClose} className="w-full rounded-xl border py-2.5 text-sm text-gray-600 hover:bg-gray-50">Close</button></div></div></div>;
}

function AssignmentFormModal({ mode, assignment, onClose, courses, onSaved }) {
  const [form, setForm] = useState(() => ({
    ...emptyAssignment,
    courseId: courses[0]?.id || "",
    ...(assignment ? {
      title: assignment.title || "",
      courseId: assignment.courseId || "",
      dueAt: dateInputValue(assignment.dueAt),
      description: assignment.description || "",
      maxScore: String(assignment.maxScore || 100),
      status: assignment.status || "published",
      attachmentUrl: assignment.attachmentUrl || "",
      attachmentName: assignment.attachmentName || "",
    } : {}),
  }));
  const [attachment, setAttachment] = useState(null);
  const [saving, setSaving] = useState(false);
  const isEdit = mode === "edit";
  const currentFileUrl = resolveMediaUrl(form.attachmentUrl);
  const change = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const uploadAttachment = async () => {
    if (!attachment) return { url: form.attachmentUrl || "", name: form.attachmentName || "" };
    const data = new FormData();
    data.append("file", attachment);
    const res = await api.post("/upload/document", data, { headers: { "Content-Type": "multipart/form-data" } });
    return { url: res.upload?.url || res.material?.url || "", name: res.upload?.name || res.material?.name || attachment.name };
  };

  const submit = async () => {
    if (!form.title || !form.courseId) return toast.error("Title and course required");
    if (!form.description.trim() && !attachment && !form.attachmentUrl) return toast.error("Add a question/instruction or attach a file");
    setSaving(true);
    try {
      const uploaded = await uploadAttachment();
      const payload = { ...form, attachmentUrl: uploaded.url, attachmentName: uploaded.name };
      if (isEdit) await api.put(`/coach/assignments/${assignment.id}`, payload);
      else await api.post("/coach/assignments", payload);
      toast.success(isEdit ? "Assignment updated" : "Assignment created");
      onClose();
      onSaved();
    } catch (err) {
      toast.error(err?.message || "Failed to save assignment");
    } finally {
      setSaving(false);
    }
  };

  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"><div className="w-full max-w-lg rounded-2xl bg-white shadow-xl"><div className="flex items-center justify-between border-b px-6 py-4"><h3 className="font-semibold text-gray-800">{isEdit ? "Edit Assignment" : "New Assignment"}</h3><button onClick={onClose} className="text-xl text-gray-400 hover:text-gray-600">&times;</button></div><div className="space-y-4 p-6"><div><label className="mb-1 block text-sm font-medium text-gray-700">Title</label><input name="title" value={form.title} onChange={change} placeholder="Assignment title" className="w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" /></div><div className="grid grid-cols-2 gap-3"><div><label className="mb-1 block text-sm font-medium text-gray-700">Course</label><select name="courseId" value={form.courseId} onChange={change} className="w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"><option value="">Select course</option>{courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}</select></div><div><label className="mb-1 block text-sm font-medium text-gray-700">Due Date</label><input type="date" name="dueAt" value={form.dueAt} onChange={change} className="w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" /></div></div><div><label className="mb-1 block text-sm font-medium text-gray-700">Question / Instructions</label><textarea name="description" value={form.description} onChange={change} rows={4} placeholder="Write the question, structure, or assignment instructions..." className="w-full resize-none rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" /></div>{currentFileUrl && !attachment && <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-3"><p className="text-xs font-bold uppercase text-indigo-500">Current attached file</p><a href={currentFileUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-2 text-sm font-bold text-indigo-700"><Paperclip size={15} /> {form.attachmentName || "Open file"}</a></div>}<label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-gray-300 p-4 hover:border-indigo-400 hover:bg-indigo-50/40"><Upload size={20} className="text-indigo-500" /><span className="min-w-0 flex-1"><span className="block text-sm font-bold text-gray-700">{attachment ? attachment.name : currentFileUrl ? "Replace attached file" : "Attach question file or structure"}</span><span className="text-xs text-gray-400">PDF, DOC, image, ZIP, PPT, or any study file</span></span><input type="file" className="hidden" onChange={(e) => setAttachment(e.target.files?.[0] || null)} /></label><div className="grid grid-cols-2 gap-3"><div><label className="mb-1 block text-sm font-medium text-gray-700">Max Score</label><input name="maxScore" type="number" value={form.maxScore} onChange={change} className="w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" /></div><div><label className="mb-1 block text-sm font-medium text-gray-700">Status</label><select name="status" value={form.status} onChange={change} className="w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"><option value="published">Published</option><option value="draft">Draft</option><option value="archived">Archived</option></select></div></div></div><div className="flex gap-3 px-6 pb-5"><button onClick={onClose} className="flex-1 rounded-xl border py-2.5 text-sm text-gray-600 hover:bg-gray-50">Cancel</button><button onClick={submit} disabled={saving} className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60">{saving ? "Saving..." : isEdit ? "Update Assignment" : "Create Assignment"}</button></div></div></div>;
}
