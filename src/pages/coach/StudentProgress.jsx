import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle,
  Clock,
  TrendingUp,
  Play,
  FileText,
  HelpCircle,
  Target,
  Calendar,
  BarChart2,
} from "lucide-react";

const StudentProgress = () => {
  const { studentId, courseId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState(null);

  // Mock data â€” replace with API call
  useEffect(() => {
    setTimeout(() => {
      setStudentData({
        student: {
          name: "Rahul Sharma",
          email: "rahul@example.com",
          avatar: null,
          enrolledDate: "2024-01-15",
          lastActive: "2024-03-10",
        },
        course: {
          title: "React.js Mastery",
          totalLessons: 24,
          totalQuizzes: 6,
          totalAssignments: 8,
        },
        progress: {
          overallPercent: 68,
          lessonsCompleted: 16,
          quizzesCompleted: 4,
          assignmentsSubmitted: 5,
          avgQuizScore: 82,
          timeSpent: "14h 30m",
          streak: 7,
        },
        lessons: [
          { id: 1, title: "Introduction to React", status: "completed", completedAt: "2024-01-20", duration: "45m" },
          { id: 2, title: "Components & Props", status: "completed", completedAt: "2024-01-22", duration: "60m" },
          { id: 3, title: "State & Lifecycle", status: "completed", completedAt: "2024-01-25", duration: "50m" },
          { id: 4, title: "Hooks Deep Dive", status: "in-progress", completedAt: null, duration: "70m" },
          { id: 5, title: "Context API", status: "locked", completedAt: null, duration: "55m" },
          { id: 6, title: "React Router", status: "locked", completedAt: null, duration: "40m" },
        ],
        quizzes: [
          { id: 1, title: "React Basics Quiz", score: 90, maxScore: 100, submittedAt: "2024-01-21" },
          { id: 2, title: "Components Quiz", score: 75, maxScore: 100, submittedAt: "2024-01-23" },
          { id: 3, title: "Hooks Quiz", score: 85, maxScore: 100, submittedAt: "2024-01-28" },
          { id: 4, title: "State Management Quiz", score: 78, maxScore: 100, submittedAt: "2024-02-05" },
        ],
        assignments: [
          { id: 1, title: "Build a Counter App", status: "graded", grade: "A", submittedAt: "2024-01-22" },
          { id: 2, title: "Todo List with Hooks", status: "graded", grade: "B+", submittedAt: "2024-01-30" },
          { id: 3, title: "API Integration", status: "submitted", grade: null, submittedAt: "2024-02-10" },
          { id: 4, title: "Redux Shopping Cart", status: "pending", grade: null, submittedAt: null },
        ],
      });
      setLoading(false);
    }, 800);
  }, [studentId, courseId]);

  const getStatusColor = (status) => {
    switch (status) {
      case "completed": return "text-green-400 bg-green-400/10";
      case "in-progress": return "text-yellow-400 bg-yellow-400/10";
      case "locked": return "text-gray-500 bg-gray-500/10";
      case "graded": return "text-blue-400 bg-blue-400/10";
      case "submitted": return "text-purple-400 bg-purple-400/10";
      case "pending": return "text-gray-500 bg-gray-500/10";
      default: return "text-gray-500 bg-gray-500/10";
    }
  };

  const getGradeColor = (grade) => {
    if (!grade) return "text-gray-400";
    if (grade.startsWith("A")) return "text-green-400";
    if (grade.startsWith("B")) return "text-blue-400";
    if (grade.startsWith("C")) return "text-yellow-400";
    return "text-red-400";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading student progress...</p>
        </div>
      </div>
    );
  }

  const { student, course, progress, lessons, quizzes, assignments } = studentData;

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-[#13131f]/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="font-semibold text-lg">{student.name}</h1>
            <p className="text-sm text-gray-400">{course.title} â€” Progress Report</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Student Info Card */}
        <div className="bg-gradient-to-r from-violet-600/20 to-indigo-600/20 border border-violet-500/20 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-2xl font-bold shrink-0">
            {student.name.charAt(0)}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold">{student.name}</h2>
            <p className="text-gray-400 text-sm">{student.email}</p>
            <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500">
              <span className="flex items-center gap-1"><Calendar size={12} /> Enrolled: {new Date(student.enrolledDate).toLocaleDateString()}</span>
              <span className="flex items-center gap-1"><Clock size={12} /> Last Active: {new Date(student.lastActive).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="flex flex-col items-center bg-white/5 rounded-xl px-6 py-4 min-w-[100px]">
            <span className="text-3xl font-black text-violet-400">{progress.overallPercent}%</span>
            <span className="text-xs text-gray-400 mt-1">Overall Progress</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { icon: BookOpen, label: "Lessons Done", value: `${progress.lessonsCompleted}/${course.totalLessons}`, color: "text-violet-400" },
            { icon: HelpCircle, label: "Quizzes Done", value: `${progress.quizzesCompleted}/${course.totalQuizzes}`, color: "text-blue-400" },
            { icon: FileText, label: "Assignments", value: `${progress.assignmentsSubmitted}/${course.totalAssignments}`, color: "text-green-400" },
            { icon: Target, label: "Avg Quiz Score", value: `${progress.avgQuizScore}%`, color: "text-yellow-400" },
            { icon: Clock, label: "Time Spent", value: progress.timeSpent, color: "text-pink-400" },
            { icon: TrendingUp, label: "Day Streak", value: `${progress.streak} days`, color: "text-orange-400" },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-2">
              <Icon size={18} className={color} />
              <div className="text-lg font-bold">{value}</div>
              <div className="text-xs text-gray-500">{label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white/5 border border-white/10 rounded-xl p-1 w-fit">
          {["overview", "lessons", "quizzes", "assignments"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                activeTab === tab ? "bg-violet-600 text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab: Overview */}
        {activeTab === "overview" && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2"><BarChart2 size={18} className="text-violet-400" /> Progress Breakdown</h3>
            <div className="space-y-4">
              {[
                { label: "Lessons Completed", value: progress.lessonsCompleted, max: course.totalLessons, color: "bg-violet-500" },
                { label: "Quizzes Completed", value: progress.quizzesCompleted, max: course.totalQuizzes, color: "bg-blue-500" },
                { label: "Assignments Submitted", value: progress.assignmentsSubmitted, max: course.totalAssignments, color: "bg-green-500" },
              ].map(({ label, value, max, color }) => (
                <div key={label}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-300">{label}</span>
                    <span className="text-gray-400">{value} / {max}</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${(value / max) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab: Lessons */}
        {activeTab === "lessons" && (
          <div className="space-y-3">
            {lessons.map((lesson) => (
              <div key={lesson.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4">
                <div className={`p-2 rounded-lg ${getStatusColor(lesson.status)}`}>
                  {lesson.status === "completed" ? <CheckCircle size={18} /> : lesson.status === "in-progress" ? <Play size={18} /> : <BookOpen size={18} />}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{lesson.title}</p>
                  {lesson.completedAt && <p className="text-xs text-gray-500 mt-0.5">Completed: {new Date(lesson.completedAt).toLocaleDateString()}</p>}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 flex items-center gap-1"><Clock size={11} /> {lesson.duration}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${getStatusColor(lesson.status)}`}>{lesson.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab: Quizzes */}
        {activeTab === "quizzes" && (
          <div className="space-y-3">
            {quizzes.map((quiz) => (
              <div key={quiz.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4">
                <div className="p-2 rounded-lg bg-blue-400/10 text-blue-400"><HelpCircle size={18} /></div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{quiz.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Submitted: {new Date(quiz.submittedAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className={`font-bold ${quiz.score >= 80 ? "text-green-400" : quiz.score >= 60 ? "text-yellow-400" : "text-red-400"}`}>{quiz.score}/{quiz.maxScore}</p>
                    <p className="text-xs text-gray-500">{Math.round((quiz.score / quiz.maxScore) * 100)}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab: Assignments */}
        {activeTab === "assignments" && (
          <div className="space-y-3">
            {assignments.map((assignment) => (
              <div key={assignment.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4">
                <div className={`p-2 rounded-lg ${getStatusColor(assignment.status)}`}><FileText size={18} /></div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{assignment.title}</p>
                  {assignment.submittedAt && <p className="text-xs text-gray-500 mt-0.5">Submitted: {new Date(assignment.submittedAt).toLocaleDateString()}</p>}
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${getStatusColor(assignment.status)}`}>{assignment.status}</span>
                  {assignment.grade && (
                    <span className={`text-lg font-black ${getGradeColor(assignment.grade)}`}>{assignment.grade}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentProgress;
