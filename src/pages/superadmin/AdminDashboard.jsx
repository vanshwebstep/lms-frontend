import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BarChart3, BookOpen, CreditCard, ShieldCheck, TrendingUp, Users } from "lucide-react";
import api from "../../services/api";
import { formatCurrency } from "../../utils/formatters";

const StatusPill = ({ children, active }) => <span className={`rounded-md px-2 py-1 text-xs font-black ${active ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{children}</span>;

export default function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [coaches, setCoaches] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    Promise.all([api.get("/admin/stats"), api.get("/admin/coaches"), api.get("/admin/courses")]).then(([statsRes, coachesRes, coursesRes]) => {
      if (!alive) return;
      setStats(statsRes.stats || {});
      setCoaches((coachesRes.coaches || []).slice(0, 4));
      setCourses((coursesRes.courses || []).slice(0, 5));
    }).finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  const metrics = [
    { label: "Active Coaches", value: stats.coaches || 0, delta: "live", icon: Users, tone: "bg-emerald-50 text-emerald-700 ring-emerald-100" },
    { label: "Students", value: stats.students || 0, delta: "registered", icon: ShieldCheck, tone: "bg-sky-50 text-sky-700 ring-sky-100" },
    { label: "Published Courses", value: stats.publishedCourses || 0, delta: `${stats.courses || 0} total`, icon: BookOpen, tone: "bg-violet-50 text-violet-700 ring-violet-100" },
    { label: "Revenue", value: formatCurrency(stats.revenue || 0), delta: `${stats.enrollments || 0} enrollments`, icon: CreditCard, tone: "bg-amber-50 text-amber-700 ring-amber-100" },
  ];

  return <div className="space-y-5"><section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"><div className="grid gap-5 bg-[#111827] p-6 text-white lg:grid-cols-[1.25fr_0.75fr]"><div><p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-300">Platform Command</p><h2 className="mt-3 text-3xl font-black tracking-tight text-white">Revenue, quality, and growth at a glance.</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">Live backend stats for coaches, students, courses, enrollments, and payment movement.</p></div><div className="rounded-lg border border-white/10 bg-white/5 p-4"><div className="flex items-center justify-between"><span className="text-sm font-bold text-slate-300">Total revenue</span><TrendingUp size={18} className="text-emerald-300" /></div><p className="mt-4 text-4xl font-black text-white">{formatCurrency(stats.revenue || 0)}</p><p className="mt-1 text-sm text-emerald-200">{loading ? "Loading..." : `${stats.enrollments || 0} enrollments`}</p><Link to="/admin/reports" className="mt-5 inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-black text-slate-950 hover:bg-slate-100">Open reports <ArrowRight size={15} /></Link></div></div></section><div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(({ label, value, delta, icon: Icon, tone }) => <div key={label} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-bold text-slate-500">{label}</p><p className="mt-2 text-3xl font-black tracking-tight text-slate-950">{value}</p></div><div className={`rounded-lg p-3 ring-1 ${tone}`}><Icon size={22} /></div></div><p className="mt-4 text-xs font-bold text-slate-500">{delta}</p></div>)}</div><div className="grid grid-cols-1 gap-5 xl:grid-cols-2"><section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-4 flex items-center justify-between"><div><h3 className="text-base font-black text-slate-950">Coach Activity</h3><p className="text-sm text-slate-500">Recent platform coaches</p></div><Link to="/admin/coaches" className="inline-flex items-center gap-1 text-sm font-black text-emerald-700">View all <ArrowRight size={14} /></Link></div><div className="space-y-3">{coaches.length === 0 ? <p className="py-8 text-center text-sm text-slate-400">No coaches found</p> : coaches.map((coach) => <div key={coach.id} className="grid grid-cols-[1fr_auto] gap-4 rounded-lg border border-slate-100 bg-slate-50/70 p-4"><div><p className="font-black text-slate-950">{coach.name}</p><p className="text-sm text-slate-500">{coach.email}</p></div><StatusPill active={coach.status === "active"}>{coach.status}</StatusPill></div>)}</div></section><section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-4 flex items-center justify-between"><div><h3 className="text-base font-black text-slate-950">Course Pipeline</h3><p className="text-sm text-slate-500">Recent catalog changes</p></div><Link to="/admin/courses" className="inline-flex items-center gap-1 text-sm font-black text-emerald-700">Manage <ArrowRight size={14} /></Link></div><div className="space-y-3">{courses.length === 0 ? <p className="py-8 text-center text-sm text-slate-400">No courses found</p> : courses.map((course) => <div key={course.id} className="rounded-lg border border-slate-100 bg-slate-50 p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-black text-slate-950">{course.title}</p><p className="text-sm text-slate-500">{course.coach?.name || "Coach"} - {course.category}</p></div><StatusPill active={course.status === "published"}>{course.status}</StatusPill></div></div>)}</div></section></div></div>;
}
