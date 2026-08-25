import { useEffect, useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../services/api";

export default function CreateLesson() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ courseId: "", title: "", description: "", contentType: "video", contentUrl: "", durationMinutes: "0", sortOrder: "0", status: "published", isPreview: false });

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
      await api.post("/coach/lessons", { ...form, status, durationMinutes: Number(form.durationMinutes || 0), sortOrder: Number(form.sortOrder || 0) });
      toast.success(status === "published" ? "Lesson published" : "Lesson saved as draft");
      navigate("/coach/manage-lessons");
    } catch (err) {
      toast.error(err?.message || "Lesson save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3"><button onClick={() => navigate(-1)} className="rounded-lg p-2 hover:bg-gray-100"><ArrowLeft size={18} /></button><div><h2 className="text-2xl font-bold text-gray-800">Create Lesson</h2><p className="text-sm text-gray-500">Add lesson content and publish it to a course.</p></div></div>
      <div className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
        <select name="courseId" value={form.courseId} onChange={change} className="w-full rounded-lg border px-3 py-2.5 text-sm"><option value="">Select course</option>{courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}</select>
        <input name="title" value={form.title} onChange={change} placeholder="Lesson title" className="w-full rounded-lg border px-3 py-2.5 text-sm" />
        <textarea name="description" value={form.description} onChange={change} rows={4} placeholder="Lesson description" className="w-full resize-none rounded-lg border px-3 py-2.5 text-sm" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3"><select name="contentType" value={form.contentType} onChange={change} className="rounded-lg border px-3 py-2.5 text-sm"><option value="video">Video</option><option value="document">Document</option><option value="link">External Link</option><option value="text">Text</option></select><input name="durationMinutes" type="number" value={form.durationMinutes} onChange={change} placeholder="Duration" className="rounded-lg border px-3 py-2.5 text-sm" /><input name="sortOrder" type="number" value={form.sortOrder} onChange={change} placeholder="Order" className="rounded-lg border px-3 py-2.5 text-sm" /></div>
        <input name="contentUrl" value={form.contentUrl} onChange={change} placeholder="Video/document/link URL" className="w-full rounded-lg border px-3 py-2.5 text-sm" />
        <label className="flex items-center gap-2 text-sm text-gray-700"><input name="isPreview" type="checkbox" checked={form.isPreview} onChange={change} /> Allow free preview</label>
      </div>
      <div className="flex gap-3"><button onClick={() => submit("draft")} disabled={saving} className="rounded-xl border px-5 py-2.5 text-sm font-medium text-gray-600 disabled:opacity-60">Save Draft</button><button onClick={() => submit("published")} disabled={saving} className="ml-auto flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white disabled:opacity-60"><Save size={16} /> {saving ? "Saving..." : "Publish Lesson"}</button></div>
    </div>
  );
}
