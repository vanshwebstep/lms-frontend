import { useEffect, useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../services/api";

export default function CreateLesson() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ courseId: "", title: "", description: "", contentType: "video", contentUrl: "", durationMinutes: "0", sortOrder: "0", dripDays: "0", status: "published", isPreview: false });

  useEffect(() => {
    let alive = true;
    api.get("/coach/courses").then((res) => {
      if (!alive) return;
      const list = res.courses || [];
      setCourses(list);
      setForm((prev) => ({ ...prev, courseId: prev.courseId || list[0]?.id || "" }));
    }).catch((err) => toast.error(err?.message || "Failed to load courses"));
    return () => { alive = false; };
  }, []);

  const change = (e) => { const { name, value, type, checked } = e.target; setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value })); };

  const submit = async (status = form.status) => {
    if (!form.courseId || !form.title.trim()) return toast.error("Course and lesson title required");
    setSaving(true);
    try {
      await api.post("/coach/lessons", { ...form, status, durationMinutes: Number(form.durationMinutes || 0), sortOrder: Number(form.sortOrder || 0), dripDays: Number(form.dripDays || 0) });
      toast.success(status === "published" ? "Lesson published" : "Lesson saved as draft");
      navigate("/coach/manage-lessons");
    } catch (err) {
      toast.error(err?.message || "Lesson save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-20 pt-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Add New Lesson</h1>
        <p className="mt-1 text-sm text-gray-500">Create content for your course</p>
      </div>
      <div className="space-y-4 rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
        <select name="courseId" value={form.courseId} onChange={change} className="w-full rounded-lg border px-3 py-2.5 text-sm font-medium">
          <option value="">Select a Course...</option>
          {courses.map((c) => (<option key={c.id} value={c.id}>{c.title}</option>))}
        </select>
        <input name="title" value={form.title} onChange={change} placeholder="Lesson Title" className="w-full rounded-lg border px-3 py-2.5 text-sm font-bold" />
        <textarea name="description" value={form.description} onChange={change} placeholder="Short description" rows={3} className="w-full rounded-lg border px-3 py-2.5 text-sm" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <select name="contentType" value={form.contentType} onChange={change} className="rounded-lg border px-3 py-2.5 text-sm">
            <option value="video">Video</option>
            <option value="document">Document</option>
            <option value="link">External Link</option>
            <option value="text">Text</option>
          </select>
          <input name="durationMinutes" type="number" value={form.durationMinutes} onChange={change} placeholder="Duration (min)" title="Duration in minutes" className="rounded-lg border px-3 py-2.5 text-sm" />
          <input name="sortOrder" type="number" value={form.sortOrder} onChange={change} placeholder="Order" title="Sort order" className="rounded-lg border px-3 py-2.5 text-sm" />
          <input name="dripDays" type="number" value={form.dripDays} onChange={change} placeholder="Drip Days" title="Unlock days after enrollment (0 = immediate)" className="rounded-lg border px-3 py-2.5 text-sm" />
        </div>
        <input name="contentUrl" value={form.contentUrl} onChange={change} placeholder="Video/document/link URL" className="w-full rounded-lg border px-3 py-2.5 text-sm" />
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input name="isPreview" type="checkbox" checked={form.isPreview} onChange={change} /> Allow free preview
        </label>
      </div>
      <div className="flex gap-3"><button onClick={() => submit("draft")} disabled={saving} className="rounded-xl border px-5 py-2.5 text-sm font-medium text-gray-600 disabled:opacity-60">Save Draft</button><button onClick={() => submit("published")} disabled={saving} className="ml-auto flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white disabled:opacity-60"><Save size={16} /> {saving ? "Saving..." : "Publish Lesson"}</button></div>
    </div>
  );
}
