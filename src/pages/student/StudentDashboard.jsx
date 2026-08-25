import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Award, BookOpen, Clock, PlayCircle, Target, TrendingUp } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    Promise.all([api.get("/student/stats"), api.get("/student/courses/enrolled")]).then(([statsRes, coursesRes]) => {
      if (!alive) return;
      setStats(statsRes.stats || {});
      setCourses(coursesRes.courses || []);
    }).finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  const avgProgress = Math.round(stats.avgProgress || 0);
  const metrics = [
    { label: "Active Courses", value: stats.enrolledCourses || 0, icon: BookOpen, tone: "bg-sky-50 text-sky-700 ring-sky-100" },
    { label: "Total Spent", value: `Rs ${stats.totalSpent || 0}`, icon: Clock, tone: "bg-violet-50 text-violet-700 ring-violet-100" },
    { label: "Avg Progress", value: `${avgProgress}%`, icon: TrendingUp, tone: "bg-emerald-50 text-emerald-700 ring-emerald-100" },
    { label: "Certificates", value: avgProgress >= 100 ? 1 : 0, icon: Award, tone: "bg-amber-50 text-amber-700 ring-amber-100" },
  ];

  const activeCourses = useMemo(() => courses.slice(0, 4), [courses]);

  return <div className="space-y-5"><section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"><div className="grid gap-5 bg-[#101828] p-6 text-white lg:grid-cols-[1fr_340px]"><div><p className="text-xs font-black uppercase tracking-[0.22em] text-sky-300">Student Hub</p><h2 className="mt-3 text-3xl font-black tracking-tight text-white">Welcome back, {user?.name || "Student"}.</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">Pick up your enrolled courses and track live progress from backend data.</p><div className="mt-5 flex flex-wrap gap-2"><Link to="/student/courses" className="inline-flex items-center gap-2 rounded-lg bg-sky-400 px-4 py-2.5 text-sm font-black text-slate-950 hover:bg-sky-300"><BookOpen size={17} /> Browse Courses</Link><Link to="/student/my-learning" className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-4 py-2.5 text-sm font-black text-white hover:bg-white/10">Continue Learning <PlayCircle size={17} /></Link></div></div><div className="rounded-lg border border-white/10 bg-white/5 p-4"><div className="flex items-center justify-between text-slate-300"><span className="text-sm font-bold">Average progress</span><Target size={18} className="text-sky-300" /></div><p className="mt-4 text-5xl font-black text-white">{avgProgress}%</p><p className="mt-1 text-sm text-sky-100">across enrolled courses</p><div className="mt-5 h-2 rounded-full bg-white/10"><div className="h-full rounded-full bg-sky-400" style={{ width: `${avgProgress}%` }} /></div></div></div></section><div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(({ label, value, icon: Icon, tone }) => <div key={label} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-bold text-slate-500">{label}</p><p className="mt-2 text-3xl font-black text-slate-950">{value}</p></div><div className={`rounded-lg p-3 ring-1 ${tone}`}><Icon size={22} /></div></div></div>)}</div><section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-4 flex items-center justify-between"><div><h3 className="font-black text-slate-950">My Active Courses</h3><p className="text-sm text-slate-500">{loading ? "Loading..." : `${activeCourses.length} courses`}</p></div><Link to="/student/my-learning" className="text-sm font-black text-sky-700 hover:text-sky-800">View all</Link></div>{loading ? <p className="py-8 text-center text-slate-400">Loading courses...</p> : activeCourses.length === 0 ? <p className="py-8 text-center text-slate-400">No enrolled courses yet</p> : <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">{activeCourses.map(({ enrollment, course }) => <article key={enrollment.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4"><div className="flex items-start justify-between gap-3"><div><h4 className="font-black text-slate-950">{course.title}</h4><p className="mt-1 text-sm text-slate-500">By {course.coach?.name || "Coach"}</p></div><span className="rounded-md bg-white px-2 py-1 text-xs font-black text-slate-700 shadow-sm">{Number(enrollment.progress || 0)}%</span></div><div className="mt-4 h-2 rounded-full bg-white"><div className="h-full rounded-full bg-sky-500" style={{ width: `${Number(enrollment.progress || 0)}%` }} /></div><Link to={`/student/learn/${course.id}`} className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-3 py-2 text-sm font-black text-white hover:bg-slate-800">Continue <PlayCircle size={15} /></Link></article>)}</div>}</section></div>;
}
