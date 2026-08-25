import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, BookOpen } from "lucide-react";
import api from "../../services/api";
import { formatCurrency } from "../../utils/formatters";
import CourseMedia from "../../components/common/CourseMedia";

const creatorLabel = (meta) => {
  if (!meta) return "Not mapped";
  if (meta.createdBy?.name) return `${meta.createdBy.name} (${meta.createdBy.role || meta.creatorRole})`;
  if (meta.creatorRole === "system") return "System defaults";
  return meta.creatorRole || "-";
};

export default function ManageCourses() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/courses").then((r) => setRows(r.courses || [])).finally(() => setLoading(false));
  }, []);

  const filtered = rows.filter((r) => `${r.title} ${r.category} ${r.coach?.name || ""} ${creatorLabel(r.categoryMeta)}`.toLowerCase().includes(q.toLowerCase()));

  return <div className="space-y-6"><div><h2 className="text-2xl font-bold text-slate-900">Courses</h2><p className="mt-1 text-sm text-slate-500">All coach-created courses with master-data ownership.</p></div><div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"><div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search courses, coaches, categories..." className="w-full rounded-lg border px-9 py-2 text-sm" /></div></div><div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"><div className="overflow-x-auto"><table className="w-full min-w-[980px] text-sm"><thead className="bg-slate-50"><tr>{["Course", "Coach", "Category", "Created By", "Students", "Price", "Status", "Action"].map((c) => <th key={c} className="px-5 py-3 text-left text-xs font-bold uppercase text-slate-500">{c}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{loading ? <tr><td colSpan={8} className="px-5 py-10 text-center text-slate-400">Loading...</td></tr> : filtered.length === 0 ? <tr><td colSpan={8} className="px-5 py-10 text-center text-slate-400"><BookOpen className="mx-auto mb-2" />No courses found</td></tr> : filtered.map((c) => <tr key={c.id} className="hover:bg-slate-50"><td className="px-5 py-3 font-semibold"><div className="flex items-center gap-3"><div className="h-10 w-14 overflow-hidden rounded-lg bg-slate-100"><CourseMedia course={c} compact /></div><span>{c.title}</span></div></td><td className="px-5 py-3"><div className="font-semibold text-slate-900">{c.coach?.name || "-"}</div><div className="text-xs text-slate-400">Course creator</div></td><td className="px-5 py-3"><span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700">{c.category}</span></td><td className="px-5 py-3 text-slate-600">{creatorLabel(c.categoryMeta)}</td><td className="px-5 py-3">{c.students || 0}</td><td className="px-5 py-3">{formatCurrency(c.price || 0, c.currency || "INR")}</td><td className="px-5 py-3">{c.status}</td><td className="px-5 py-3"><Link className="font-semibold text-indigo-600" to={`/admin/courses/${c.id}`}>View/Edit</Link></td></tr>)}</tbody></table></div></div></div>;
}