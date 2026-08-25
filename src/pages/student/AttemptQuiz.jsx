import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, BarChart2, CheckCircle, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";

export default function AttemptQuiz() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [result, setResult] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let alive = true;
    api.get("/student/quizzes").then((res) => {
      if (!alive) return;
      const found = (res.quizzes || []).find((item) => item.id === quizId);
      setQuiz(found || null);
    }).catch((err) => toast.error(err?.message || "Failed to load quiz")).finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [quizId]);

  const questions = useMemo(() => quiz?.questionItems || [], [quiz]);
  const answeredCount = Object.keys(answers).length;
  const progress = questions.length ? Math.round((answeredCount / questions.length) * 100) : 0;

  const submit = async () => {
    if (questions.some((question) => answers[question.id] === undefined)) return toast.error("Answer all questions before submitting");
    setSaving(true);
    try {
      const res = await api.post(`/student/quizzes/${quizId}/attempts`, { answers });
      setResult(res.attempt || null);
      toast.success(`Quiz ${res.attempt?.status || "submitted"}`);
    } catch (err) {
      toast.error(err?.message || "Quiz submit failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="rounded-2xl bg-white p-10 text-center text-slate-500 shadow-sm">Loading quiz...</div>;
  if (!quiz) return <div className="rounded-2xl bg-white p-10 text-center text-slate-500 shadow-sm">Quiz not found</div>;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link to={quiz.courseId ? `/student/learn/${quiz.courseId}` : "/student/my-learning"} className="inline-flex items-center gap-2 text-sm font-semibold text-sky-700"><ArrowLeft size={16} /> Back to Course</Link>

      <section className="rounded-2xl bg-slate-900 p-6 text-white">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-sky-300">Performance Test</p>
        <h2 className="mt-3 text-3xl font-black">{quiz.title}</h2>
        <p className="mt-3 text-sm leading-6 text-slate-300">{quiz.description || "Answer all MCQ questions and submit to check your performance."}</p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold"><span className="rounded-full bg-white/10 px-3 py-1">{quiz.course?.title || "Course"}</span><span className="rounded-full bg-white/10 px-3 py-1">Pass: {quiz.passingScore}%</span><span className="rounded-full bg-white/10 px-3 py-1">Questions: {questions.length}</span></div>
        {!result && <div className="mt-5"><div className="flex justify-between text-xs font-bold text-slate-300"><span>Answered</span><span>{answeredCount}/{questions.length}</span></div><div className="mt-2 h-2 rounded-full bg-white/10"><div className="h-full rounded-full bg-sky-400" style={{ width: `${progress}%` }} /></div></div>}
      </section>

      {result ? <ResultCard result={result} quiz={quiz} onContinue={() => navigate(quiz.courseId ? `/student/learn/${quiz.courseId}` : "/student/my-learning")} /> : (
        <div className="space-y-4">
          {questions.map((question, qIndex) => (
            <article key={question.id} className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sm font-black text-sky-700">{qIndex + 1}</div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold uppercase text-slate-400">Question {qIndex + 1}</p>
                  <h3 className="mt-1 font-black text-slate-900">{question.text}</h3>
                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {(question.options || []).map((option, index) => {
                      const selected = answers[question.id] === index;
                      return <button key={index} onClick={() => setAnswers((prev) => ({ ...prev, [question.id]: index }))} className={`rounded-xl border px-4 py-3 text-left text-sm font-bold transition ${selected ? "border-sky-500 bg-sky-50 text-sky-700 ring-2 ring-sky-100" : "text-slate-600 hover:bg-slate-50"}`}><span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs text-slate-600">{String.fromCharCode(65 + index)}</span>{option}</button>;
                    })}
                  </div>
                </div>
              </div>
            </article>
          ))}
          {questions.length === 0 && <div className="rounded-2xl bg-white p-10 text-center text-slate-500 shadow-sm">No questions in this quiz yet</div>}
          <button onClick={submit} disabled={saving || !questions.length} className="w-full rounded-xl bg-sky-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-60">{saving ? "Submitting..." : "Submit Test"}</button>
        </div>
      )}
    </div>
  );
}

function ResultCard({ result, quiz, onContinue }) {
  const score = Number(result.score || 0);
  const passed = result.status === "passed" || score >= Number(quiz.passingScore || 0);
  const correct = result.correctAnswers ?? "-";
  const total = result.totalQuestions || quiz.questionItems?.length || 0;
  const earned = result.earnedScore ?? "-";
  const max = result.maxScore ?? total;

  return (
    <section className="rounded-2xl bg-white p-8 text-center shadow-sm">
      <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl ${passed ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>{passed ? <CheckCircle size={34} /> : <XCircle size={34} />}</div>
      <p className="mt-5 text-xs font-black uppercase tracking-[0.22em] text-slate-400">Quiz Result</p>
      <h3 className="mt-2 text-3xl font-black capitalize text-slate-900">{passed ? "Passed" : "Needs Practice"}</h3>
      <p className="mt-2 text-slate-500">Score: {score}%</p>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-slate-50 p-4"><BarChart2 className="mx-auto text-sky-600" size={22} /><p className="mt-2 text-2xl font-black text-slate-900">{score}%</p><p className="text-xs font-bold text-slate-500">Score</p></div>
        <div className="rounded-2xl bg-slate-50 p-4"><CheckCircle className="mx-auto text-green-600" size={22} /><p className="mt-2 text-2xl font-black text-slate-900">{correct}/{total}</p><p className="text-xs font-bold text-slate-500">Correct Answers</p></div>
        <div className="rounded-2xl bg-slate-50 p-4"><BarChart2 className="mx-auto text-indigo-600" size={22} /><p className="mt-2 text-2xl font-black text-slate-900">{earned}/{max}</p><p className="text-xs font-bold text-slate-500">Marks</p></div>
      </div>

      <button onClick={onContinue} className="mt-7 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white">Back to Course</button>
    </section>
  );
}