import { useEffect, useMemo, useState } from "react";
import { Search, Filter, Users, BookOpen, Eye, MessageSquare } from "lucide-react";
import api from "../../services/api";
import { formatDate } from "../../utils/formatters";
import { resolveMediaUrl } from "../../utils/media";

export default function MyStudents() {
  const [rows, setRows] = useState([]);
  const [stats, setStats] = useState({ students: 0, enrollments: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("All Courses");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        setLoading(true);
        const res = await api.get("/coach/students");
        if (alive) {
          setRows(res.students || []);
          setStats(res.stats || {});
        }
      } catch (err) {
        if (alive) setError(err?.message || "Failed to load students");
      } finally {
        if (alive) setLoading(false);
      }
    };
    load();
    return () => { alive = false; };
  }, []);

  const courseOptions = useMemo(() => ["All Courses", ...new Set(rows.map((r) => r.course?.title).filter(Boolean))], [rows]);

  const filtered = rows.filter((row) => {
    const student = row.student || {};
    const enrollment = row.enrollment || {};
    const course = row.course || {};
    const matchSearch = `${student.name || ""} ${student.email || ""}`.toLowerCase().includes(search.toLowerCase());
    const matchCourse = courseFilter === "All Courses" || course.title === courseFilter;
    const visibleStatus = enrollment.status === "active" ? "Active" : "Inactive";
    const matchStatus = statusFilter === "All" || visibleStatus === statusFilter;
    return matchSearch && matchCourse && matchStatus;
  });

  const avgProgress = filtered.length ? Math.round(filtered.reduce((sum, row) => sum + Number(row.enrollment?.progress || 0), 0) / filtered.length) : 0;

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold text-gray-800">My Students</h2><p className="text-sm text-gray-500 mt-1">{loading ? "Loading students..." : `${filtered.length} student enrollment(s)`}</p></div>
      <div className="grid grid-cols-3 gap-4">
        {[{ label: "Total Students", value: stats.students || 0, icon: Users, color: "text-indigo-600", bg: "bg-indigo-100" }, { label: "Enrollments", value: stats.enrollments || 0, icon: Users, color: "text-green-600", bg: "bg-green-100" }, { label: "Avg Progress", value: `${avgProgress}%`, icon: BookOpen, color: "text-yellow-600", bg: "bg-yellow-100" }].map((item) => (<div key={item.label} className="bg-white rounded-2xl shadow-sm p-4 flex items-center gap-3"><div className={`${item.bg} p-2.5 rounded-xl`}><item.icon size={20} className={item.color} /></div><div><p className="text-xs text-gray-500">{item.label}</p><p className="text-xl font-bold text-gray-800">{item.value}</p></div></div>))}
      </div>
      <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="text" placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" /></div>
        <div className="flex items-center gap-2"><Filter size={16} className="text-gray-400" /><select value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)} className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">{courseOptions.map((c) => <option key={c}>{c}</option>)}</select></div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"><option>All</option><option>Active</option><option>Inactive</option></select>
      </div>
      {error && <div className="bg-red-50 text-red-600 border border-red-100 rounded-xl px-4 py-3 text-sm">{error}</div>}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-gray-50 border-b"><tr>{["Student", "Course", "Progress", "Join Date", "Status", "Actions"].map((h) => <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>)}</tr></thead><tbody className="divide-y divide-gray-100">{loading ? <tr><td colSpan={6} className="text-center py-12 text-gray-400">Loading students...</td></tr> : filtered.length === 0 ? <tr><td colSpan={6} className="text-center py-12 text-gray-400"><Users size={36} className="mx-auto mb-2 opacity-30" />No students found</td></tr> : filtered.map((row) => { const student = row.student || {}; const enrollment = row.enrollment || {}; const course = row.course || {}; const status = enrollment.status === "active" ? "Active" : "Inactive"; return <tr key={enrollment.id} className="hover:bg-gray-50 transition-colors"><td className="px-5 py-3"><div className="flex items-center gap-3"><div className="h-9 w-9 overflow-hidden rounded-full bg-indigo-100 text-sm font-semibold text-indigo-600">{resolveMediaUrl(student.avatar) ? <img src={resolveMediaUrl(student.avatar)} alt={student.name} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center">{(student.name || "S")[0]}</div>}</div><div><p className="font-medium text-gray-800">{student.name}</p><p className="text-xs text-gray-500">{student.email}</p></div></div></td><td className="px-5 py-3"><span className="bg-indigo-50 text-indigo-600 text-xs px-2 py-1 rounded-full">{course.title}</span></td><td className="px-5 py-3"><div className="flex items-center gap-2"><div className="flex-1 bg-gray-200 rounded-full h-1.5 w-24"><div className="h-1.5 rounded-full bg-indigo-500" style={{ width: `${Number(enrollment.progress || 0)}%` }} /></div><span className="text-xs text-gray-600 font-medium">{Number(enrollment.progress || 0)}%</span></div></td><td className="px-5 py-3 text-gray-500 text-xs">{enrollment.created_at ? formatDate(enrollment.created_at) : "-"}</td><td className="px-5 py-3"><span className={`text-xs px-2 py-1 rounded-full font-medium ${status === "Active" ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"}`}>{status}</span></td><td className="px-5 py-3"><div className="flex items-center gap-2"><button className="p-1.5 hover:bg-indigo-50 rounded-lg text-indigo-500 transition" title="View Progress"><Eye size={15} /></button><button className="p-1.5 hover:bg-green-50 rounded-lg text-green-500 transition" title="Message"><MessageSquare size={15} /></button></div></td></tr>; })}</tbody></table></div></div>
    </div>
  );
}