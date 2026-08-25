import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";
import api from "../../services/api";

export default function MyLearning() {
  const [rows, setRows] = useState([]); const [loading, setLoading] = useState(true);
  useEffect(() => { api.get("/student/courses/enrolled").then((r) => setRows(r.courses || [])).finally(() => setLoading(false)); }, []);
  return <div className="space-y-6"><div><h2 className="text-2xl font-bold text-slate-900">My Learning</h2><p className="text-sm text-slate-500 mt-1">Your enrolled courses</p></div>{loading ? <div className="bg-white rounded-lg p-10 text-center text-slate-500">Loading...</div> : rows.length === 0 ? <div className="bg-white rounded-lg p-10 text-center text-slate-500"><BookOpen className="mx-auto mb-2" />No enrolled courses yet. Buy a course first.</div> : <div className="grid grid-cols-1 md:grid-cols-2 gap-5">{rows.map(({ enrollment, course }) => <div key={enrollment.id} className="bg-white rounded-2xl shadow-sm p-5"><h3 className="font-bold text-slate-900">{course.title}</h3><p className="text-sm text-slate-500 mt-1">By {course.coach?.name}</p><div className="mt-4 h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-sky-500" style={{ width: `${Number(enrollment.progress || 0)}%` }} /></div><p className="mt-2 text-xs text-slate-500">{Number(enrollment.progress || 0)}% complete</p><Link to={`/student/learn/${course.id}`} className="mt-4 inline-flex rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white">Continue</Link></div>)}</div>}</div>;
}
