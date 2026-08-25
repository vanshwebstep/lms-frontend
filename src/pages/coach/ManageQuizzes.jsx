import { useEffect, useMemo, useState } from "react";
import { BarChart2, CheckCircle, Edit2, HelpCircle, Plus, Search, Trash2, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../services/api";
import { confirmDialog } from "../../utils/dialogs";

export default function ManageQuizzes() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [search, setSearch] = useState("");
  const [courseId, setCourseId] = useState("all");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const [courseRes, quizRes] = await Promise.all([api.get("/coach/courses"), api.get("/coach/quizzes")]);
      setCourses(courseRes.courses || []);
      setQuizzes(quizRes.quizzes || []);
    } catch (err) {
      toast.error(err?.message || "Failed to load quizzes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => quizzes.filter((quiz) => {
    const matchSearch = quiz.title?.toLowerCase().includes(search.toLowerCase());
    const matchCourse = courseId === "all" || quiz.courseId === courseId;
    return matchSearch && matchCourse;
  }), [quizzes, search, courseId]);

  const remove = async (id) => {
    const ok = await confirmDialog({ title: "Delete quiz?", message: "This quiz and its questions will be removed.", confirmText: "Delete Quiz", tone: "danger" });
    if (!ok) return;
    try {
      await api.delete(`/coach/quizzes/${id}`);
      toast.success("Quiz deleted");
      load();
    } catch (err) {
      toast.error(err?.message || "Delete failed");
    }
  };

  const published = quizzes.filter((q) => q.status === "published").length;
  const attempts = quizzes.reduce((sum, q) => sum + Number(q.attempts || 0), 0);
  const avgScore = quizzes.length ? Math.round(quizzes.reduce((sum, q) => sum + Number(q.avgScore || 0), 0) / quizzes.length) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div><h2 className="text-2xl font-bold text-gray-800">Manage Quizzes</h2><p className="mt-1 text-sm text-gray-500">Create and track course quizzes</p></div><button onClick={() => navigate("/coach/create-quiz")} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"><Plus size={16} /> Create Quiz</button></div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">{[{ label: "Total Quizzes", value: quizzes.length, icon: HelpCircle }, { label: "Published", value: published, icon: CheckCircle }, { label: "Attempts", value: attempts, icon: Users }, { label: "Avg Score", value: `${avgScore}%`, icon: BarChart2 }].map(({ label, value, icon: Icon }) => <div key={label} className="rounded-xl bg-white p-4 shadow-sm"><Icon className="text-indigo-600" size={20} /><p className="mt-2 text-xl font-bold text-gray-800">{value}</p><p className="text-xs text-gray-500">{label}</p></div>)}</div>
      <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm sm:flex-row"><div className="relative flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search quizzes..." className="w-full rounded-lg border py-2 pl-9 pr-3 text-sm" /></div><select value={courseId} onChange={(e) => setCourseId(e.target.value)} className="rounded-lg border px-3 py-2 text-sm"><option value="all">All Courses</option>{courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}</select></div>
      <div className="grid gap-4">{loading ? <div className="rounded-2xl bg-white p-10 text-center text-gray-400">Loading quizzes...</div> : filtered.length === 0 ? <div className="rounded-2xl bg-white p-10 text-center text-gray-400">No quizzes found</div> : filtered.map((quiz) => <div key={quiz.id} className="rounded-2xl bg-white p-5 shadow-sm"><div className="flex items-start gap-4"><div className="rounded-xl bg-indigo-50 p-3 text-indigo-600"><HelpCircle size={22} /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold text-gray-800">{quiz.title}</h3><span className={`rounded-full px-2 py-0.5 text-xs ${quiz.status === "published" ? "bg-green-100 text-green-600" : "bg-yellow-100 text-yellow-600"}`}>{quiz.status}</span></div><p className="mt-1 text-sm text-gray-500">{quiz.description || "No description"}</p><p className="mt-1 text-xs text-indigo-600">{quiz.course?.title || "Course"}</p><div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-500"><span>{quiz.questions || 0} Questions</span><span>{quiz.attempts || 0} Attempts</span><span>Avg {Math.round(quiz.avgScore || 0)}%</span><span>Pass {quiz.passingScore || 50}%</span></div></div><div className="flex gap-1"><button onClick={() => navigate(`/coach/quizzes/${quiz.id}/edit`)} className="rounded-lg p-2 hover:bg-indigo-50"><Edit2 size={16} className="text-indigo-500" /></button><button onClick={() => remove(quiz.id)} className="rounded-lg p-2 hover:bg-red-50"><Trash2 size={16} className="text-red-500" /></button></div></div></div>)}</div>
    </div>
  );
}
