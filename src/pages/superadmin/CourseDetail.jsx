import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, BookOpen, CheckCircle, DollarSign, Save, Tag, Users } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";
import { formatCurrency } from "../../utils/formatters";
import RichTextContent from "../../components/common/RichTextContent";
import CourseMedia from "../../components/common/CourseMedia";

export default function CourseDetail() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [form, setForm] = useState({ status: "", price: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/courses/${id}`);
      setCourse(res.course || null);
      setForm({ status: res.course?.status || "draft", price: String(res.course?.price ?? "") });
    } catch (err) {
      toast.error(err?.message || "Failed to load course");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const save = async () => {
    if (!course) return;
    setSaving(true);
    try {
      const res = await api.put(`/admin/courses/${id}`, { ...course, status: form.status, price: Number(form.price || 0) });
      setCourse(res.course || course);
      toast.success("Course updated");
    } catch (err) {
      toast.error(err?.message || "Course update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="rounded-2xl bg-white p-10 text-center text-slate-500 shadow-sm">Loading course...</div>;
  if (!course) return <div className="rounded-2xl bg-white p-10 text-center text-slate-500 shadow-sm">Course not found</div>;

  const stats = [
    { label: "Students", value: course.students || 0, icon: Users, tone: "bg-indigo-100 text-indigo-600" },
    { label: "Revenue", value: formatCurrency(course.revenue || 0, course.currency || "INR"), icon: DollarSign, tone: "bg-green-100 text-green-600" },
    { label: "Price", value: formatCurrency(course.price || 0, course.currency || "INR"), icon: Tag, tone: "bg-amber-100 text-amber-600" },
    { label: "Status", value: course.status, icon: CheckCircle, tone: "bg-sky-100 text-sky-600" },
  ];

  return <div className="max-w-5xl space-y-6"><Link to="/admin/courses" className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700"><ArrowLeft size={16} /> Back to courses</Link><section className="overflow-hidden rounded-2xl bg-slate-900 text-white"><div className="aspect-video max-h-[360px] bg-slate-950"><CourseMedia course={course} /></div><div className="flex flex-col gap-5 p-6 lg:flex-row lg:items-start lg:justify-between"><div><p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-300">Admin Course Detail</p><h2 className="mt-3 text-3xl font-black">{course.title}</h2><RichTextContent html={course.description} dark className="mt-3 max-w-3xl" /><div className="mt-4 flex flex-wrap gap-2 text-xs font-bold"><span className="rounded-full bg-white/10 px-3 py-1">{course.category}</span><span className="rounded-full bg-white/10 px-3 py-1">{course.difficulty}</span><span className="rounded-full bg-white/10 px-3 py-1">{course.language}</span></div></div><div className="rounded-xl bg-white p-4 text-slate-900"><p className="text-xs font-bold text-slate-500">Coach</p><p className="mt-1 font-black">{course.coach?.name || "-"}</p><p className="text-xs text-slate-500">{course.coach?.email || ""}</p></div></div></section><div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">{stats.map(({ label, value, icon: Icon, tone }) => <div key={label} className="rounded-2xl bg-white p-5 shadow-sm"><div className="flex items-center gap-3"><div className={`rounded-xl p-2.5 ${tone}`}><Icon size={18} /></div><div><p className="text-xs text-slate-500">{label}</p><p className="font-black text-slate-900">{value}</p></div></div></div>)}</div><div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]"><section className="rounded-2xl bg-white p-5 shadow-sm"><h3 className="font-black text-slate-900">Course Outcomes</h3><div className="mt-4 divide-y rounded-xl border">{(course.outcomes?.length ? course.outcomes : ["No outcomes added"]).map((item, index) => <div key={`${item}-${index}`} className="flex items-center gap-3 p-4"><BookOpen size={16} className="text-emerald-600" /><span className="text-sm text-slate-700">{item}</span></div>)}</div><h3 className="mt-6 font-black text-slate-900">Requirements</h3><div className="mt-4 divide-y rounded-xl border">{(course.requirements?.length ? course.requirements : ["No requirements added"]).map((item, index) => <div key={`${item}-${index}`} className="flex items-center gap-3 p-4"><CheckCircle size={16} className="text-sky-600" /><span className="text-sm text-slate-700">{item}</span></div>)}</div></section><aside className="rounded-2xl bg-white p-5 shadow-sm"><h3 className="font-black text-slate-900">Admin Controls</h3><label className="mt-4 block text-sm font-semibold text-slate-600">Status</label><select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))} className="mt-1 w-full rounded-lg border px-3 py-2.5 text-sm"><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select><label className="mt-4 block text-sm font-semibold text-slate-600">Price</label><input type="number" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} className="mt-1 w-full rounded-lg border px-3 py-2.5 text-sm" /><button onClick={save} disabled={saving} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"><Save size={16} /> {saving ? "Saving..." : "Save Changes"}</button></aside></div></div>;
}
