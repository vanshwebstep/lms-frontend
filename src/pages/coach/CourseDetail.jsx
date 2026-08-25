import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, BookOpen, ClipboardList, DollarSign, PlayCircle, Tag, Users } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";
import { formatCurrency, formatDate } from "../../utils/formatters";
import RichTextContent from "../../components/common/RichTextContent";
import CourseMedia from "../../components/common/CourseMedia";

const tabs = ["Overview", "Lessons", "Assignments", "Students", "Plans"];

export default function CourseDetail() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("Overview");
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [students, setStudents] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        setLoading(true);
        const [courseRes, lessonRes, assignmentRes, studentRes, planRes] = await Promise.all([
          api.get(`/coach/courses/${id}`),
          api.get(`/coach/lessons?courseId=${encodeURIComponent(id)}`),
          api.get("/coach/assignments"),
          api.get("/coach/students"),
          api.get("/coach/pricing-plans"),
        ]);
        if (!alive) return;
        setCourse(courseRes.course || null);
        setLessons(lessonRes.lessons || []);
        setAssignments((assignmentRes.assignments || []).filter((item) => item.courseId === id));
        setStudents((studentRes.students || []).filter((row) => row.course?.id === id));
        setPlans((planRes.plans || []).filter((plan) => plan.courseId === id));
      } catch (err) {
        toast.error(err?.message || "Failed to load course detail");
      } finally {
        if (alive) setLoading(false);
      }
    };
    load();
    return () => { alive = false; };
  }, [id]);

  const avgProgress = useMemo(() => students.length ? Math.round(students.reduce((sum, row) => sum + Number(row.enrollment?.progress || 0), 0) / students.length) : 0, [students]);

  if (loading) return <div className="rounded-2xl bg-white p-10 text-center text-gray-500 shadow-sm">Loading course...</div>;
  if (!course) return <div className="rounded-2xl bg-white p-10 text-center text-gray-500 shadow-sm">Course not found</div>;

  const stats = [
    { label: "Students", value: students.length || course.students || 0, icon: Users, color: "text-indigo-600", bg: "bg-indigo-100" },
    { label: "Lessons", value: lessons.length, icon: PlayCircle, color: "text-blue-600", bg: "bg-blue-100" },
    { label: "Revenue", value: formatCurrency(course.revenue || 0, course.currency || "INR"), icon: DollarSign, color: "text-green-600", bg: "bg-green-100" },
    { label: "Assignments", value: assignments.length, icon: ClipboardList, color: "text-orange-500", bg: "bg-orange-100" },
  ];

  return <div className="max-w-5xl space-y-6"><div className="flex items-start gap-4"><Link to="/coach/my-courses" className="mt-1 rounded-xl p-2 transition hover:bg-gray-100"><ArrowLeft size={20} className="text-gray-500" /></Link><div className="flex-1"><div className="flex flex-wrap items-center gap-3"><h2 className="text-2xl font-bold text-gray-800">{course.title}</h2><span className={`rounded-full px-2 py-1 text-xs font-medium ${course.status === "published" ? "bg-green-100 text-green-600" : "bg-yellow-100 text-yellow-600"}`}>{course.status}</span></div><div className="mt-1 flex flex-wrap items-center gap-4 text-xs text-gray-500"><span className="flex items-center gap-1"><Tag size={12} /> ID: {course.id}</span><span>{course.category}</span><span>{course.difficulty}</span><span>{course.language}</span></div></div></div><div className="grid grid-cols-2 gap-4 sm:grid-cols-4">{stats.map((s) => <div key={s.label} className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm"><div className={`${s.bg} rounded-xl p-2.5`}><s.icon size={18} className={s.color} /></div><div><p className="text-xs text-gray-500">{s.label}</p><p className="text-lg font-bold text-gray-800">{s.value}</p></div></div>)}</div><div className="flex w-fit gap-1 rounded-xl bg-gray-100 p-1">{tabs.map((tab) => <button key={tab} onClick={() => setActiveTab(tab)} className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${activeTab === tab ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>{tab}</button>)}</div>{activeTab === "Overview" && <div className="grid grid-cols-1 gap-5 lg:grid-cols-3"><div className="space-y-4 rounded-2xl bg-white p-5 shadow-sm lg:col-span-2"><div className="aspect-video overflow-hidden rounded-xl bg-slate-950"><CourseMedia course={course} /></div><div><h3 className="mb-2 font-semibold text-gray-700">Description</h3><RichTextContent html={course.description} /></div><div className="grid grid-cols-3 gap-3 text-sm"><div className="rounded-xl bg-gray-50 p-3 text-center"><p className="text-xs text-gray-400">Language</p><p className="mt-0.5 font-semibold text-gray-700">{course.language}</p></div><div className="rounded-xl bg-gray-50 p-3 text-center"><p className="text-xs text-gray-400">Avg Progress</p><p className="mt-0.5 font-semibold text-gray-700">{avgProgress}%</p></div><div className="rounded-xl bg-gray-50 p-3 text-center"><p className="text-xs text-gray-400">Price</p><p className="mt-0.5 font-semibold text-gray-700">{formatCurrency(course.price || 0)}</p></div></div></div><div className="space-y-3 rounded-2xl bg-white p-5 shadow-sm"><h3 className="font-semibold text-gray-700">Quick Actions</h3>{[{ label: "Manage Lessons", to: "/coach/manage-lessons", icon: BookOpen }, { label: "Assignments", to: "/coach/assignments", icon: ClipboardList }, { label: "Pricing Plans", to: "/coach/pricing-plans", icon: DollarSign }].map((a) => <Link key={a.label} to={a.to} className="flex items-center gap-3 rounded-xl border p-3 transition-colors hover:bg-indigo-50"><a.icon size={16} className="text-indigo-500" /><span className="text-sm text-gray-700">{a.label}</span></Link>)}</div></div>}{activeTab === "Lessons" && <Table headers={["Lesson", "Type", "Duration", "Status"]} empty="No lessons yet" rows={lessons.map((lesson) => [lesson.title, lesson.contentType, `${lesson.durationMinutes || 0} min`, lesson.status])} />}{activeTab === "Assignments" && <Table headers={["Assignment", "Due", "Submissions", "Status"]} empty="No assignments yet" rows={assignments.map((assignment) => [assignment.title, assignment.dueAt ? formatDate(assignment.dueAt) : "-", `${assignment.submissions || 0}/${assignment.total || 0}`, assignment.status])} />}{activeTab === "Students" && <Table headers={["Student", "Email", "Progress", "Status"]} empty="No enrolled students yet" rows={students.map((row) => [row.student?.name || "-", row.student?.email || "-", `${Number(row.enrollment?.progress || 0)}%`, row.enrollment?.status || "-"])} />}{activeTab === "Plans" && <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">{plans.length === 0 ? <div className="col-span-full rounded-2xl bg-white p-10 text-center text-gray-400 shadow-sm">No pricing plans for this course</div> : plans.map((plan) => <div key={plan.id} className="rounded-2xl bg-white p-5 shadow-sm"><h3 className="text-lg font-bold text-gray-800">{plan.name}</h3><p className="mt-2 text-2xl font-black text-indigo-600">{formatCurrency(plan.price || 0)}</p><p className="text-sm text-gray-500">{plan.duration} days</p><ul className="mt-4 space-y-2 text-sm text-gray-600">{(plan.features || []).map((feature, index) => <li key={index}>- {feature}</li>)}</ul></div>)}</div>}</div>;
}

function Table({ headers, rows, empty }) {
  return <div className="overflow-hidden rounded-2xl bg-white shadow-sm"><table className="w-full text-sm"><thead className="bg-gray-50"><tr>{headers.map((header) => <th key={header} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{header}</th>)}</tr></thead><tbody className="divide-y divide-gray-100">{rows.length === 0 ? <tr><td colSpan={headers.length} className="py-10 text-center text-gray-400">{empty}</td></tr> : rows.map((row, rowIndex) => <tr key={rowIndex} className="hover:bg-gray-50">{row.map((cell, cellIndex) => <td key={cellIndex} className="px-5 py-3 text-gray-700">{cell}</td>)}</tr>)}</tbody></table></div>;
}
