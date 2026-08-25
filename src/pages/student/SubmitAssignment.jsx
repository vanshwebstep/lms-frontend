import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Download, Paperclip, Send, Upload } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";
import { formatDate } from "../../utils/formatters";
import { resolveMediaUrl } from "../../utils/media";

const submissionStatusLabel = (status) => {
  if (status === "graded") return "Accepted";
  if (status === "pending") return "Rejected - needs revision";
  if (status === "submitted") return "Submitted for review";
  return status || "Not submitted";
};

export default function SubmitAssignment() {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [form, setForm] = useState({ answerText: "", fileUrl: "" });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let alive = true;
    api.get("/student/assignments").then((res) => {
      if (!alive) return;
      const found = (res.assignments || []).find((item) => item.assignment?.id === assignmentId);
      setAssignment(found?.assignment || null);
      setSubmission(found?.submission || null);
      setForm({ answerText: found?.submission?.answerText || "", fileUrl: found?.submission?.fileUrl || "" });
    }).catch((err) => toast.error(err?.message || "Failed to load assignment")).finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [assignmentId]);

  const uploadSubmissionFile = async () => {
    if (!file) return form.fileUrl;
    const data = new FormData();
    data.append("file", file);
    const res = await api.post("/upload/document", data, { headers: { "Content-Type": "multipart/form-data" } });
    return res.upload?.url || res.material?.url || "";
  };

  const submit = async () => {
    if (!form.answerText.trim() && !file && !form.fileUrl) return toast.error("Write an answer or upload a file");
    setSaving(true);
    try {
      const fileUrl = await uploadSubmissionFile();
      await api.post(`/student/assignments/${assignmentId}/submit`, { answerText: form.answerText, fileUrl });
      toast.success("Assignment submitted");
      navigate("/student/my-learning");
    } catch (err) {
      toast.error(err?.message || "Submit failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="rounded-2xl bg-white p-10 text-center text-slate-500 shadow-sm">Loading assignment...</div>;
  if (!assignment) return <div className="rounded-2xl bg-white p-10 text-center text-slate-500 shadow-sm">Assignment not found</div>;

  const assignmentFile = resolveMediaUrl(assignment.attachmentUrl);
  const submittedFile = resolveMediaUrl(form.fileUrl);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link to="/student/my-learning" className="inline-flex items-center gap-2 text-sm font-semibold text-sky-700"><ArrowLeft size={16} /> Back</Link>
      <section className="rounded-2xl bg-slate-900 p-6 text-white">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-sky-300">Assignment</p>
        <h2 className="mt-3 text-3xl font-black">{assignment.title}</h2>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-300">{assignment.description}</p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
          <span className="rounded-full bg-white/10 px-3 py-1">{assignment.course?.title || "Course"}</span>
          <span className="rounded-full bg-white/10 px-3 py-1">Due: {assignment.dueAt ? formatDate(assignment.dueAt) : "-"}</span>
          <span className="rounded-full bg-white/10 px-3 py-1">Max: {assignment.maxScore}</span>
        </div>
        {assignmentFile && (
          <div className="mt-5 flex flex-wrap gap-2">
            <a href={assignmentFile} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-bold text-slate-900 hover:bg-slate-100"><Paperclip size={16} /> View question file</a>
            <a href={assignmentFile} download className="inline-flex items-center gap-2 rounded-lg bg-slate-700 px-3 py-2 text-sm font-bold text-white hover:bg-slate-600"><Download size={16} /> Download file</a>
          </div>
        )}
      </section>
      {submission && <div className="rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-700">Existing submission status: {submissionStatusLabel(submission.status)}{submission.score !== null && submission.score !== undefined ? `, score: ${submission.score}` : ""}{submittedFile ? <a href={submittedFile} target="_blank" rel="noreferrer" className="ml-2 font-bold underline">Open submitted file</a> : null}</div>}
      <div className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">Answer</label>
          <textarea value={form.answerText} onChange={(e) => setForm((p) => ({ ...p, answerText: e.target.value }))} rows={8} placeholder="Write your assignment answer..." className="w-full resize-none rounded-lg border px-3 py-2.5 text-sm" />
        </div>
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-300 p-4 hover:border-sky-400 hover:bg-sky-50/50">
          <Upload size={20} className="text-sky-600" />
          <span className="min-w-0 flex-1"><span className="block text-sm font-bold text-slate-800">{file ? file.name : form.fileUrl ? "Replace submitted file" : "Upload answer file"}</span><span className="text-xs text-slate-400">PDF, DOC, image, ZIP, PPT, or any answer file</span></span>
          <input type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </label>
        {submittedFile && !file && <a href={submittedFile} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-bold text-sky-700"><Paperclip size={15} /> Current submitted file</a>}
        <button onClick={submit} disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-60"><Send size={16} /> {saving ? "Submitting..." : "Submit Assignment"}</button>
      </div>
    </div>
  );
}
