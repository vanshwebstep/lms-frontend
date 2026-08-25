import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, CheckCircle, Plus, Save, Trash2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../services/api";

const makeQuestion = () => ({
  id: `local-${Date.now()}-${Math.random()}`,
  text: "",
  options: ["", ""],
  correct: 0,
  marks: 1,
});

const normalizeQuestion = (question) => ({
  id: question.id || `local-${Date.now()}-${Math.random()}`,
  text: question.text || "",
  options: Array.isArray(question.options) && question.options.length >= 2 ? question.options : ["", ""],
  correct: Number(question.correctAnswer ?? question.correct ?? 0),
  marks: Number(question.marks || 1),
});

export default function CreateQuiz() {
  const navigate = useNavigate();
  const { quizId } = useParams();
  const editing = Boolean(quizId);
  const [courses, setCourses] = useState([]);
  const [meta, setMeta] = useState({ title: "", description: "", courseId: "", passingScore: "60", status: "published" });
  const [questions, setQuestions] = useState([makeQuestion()]);
  const [loading, setLoading] = useState(Boolean(quizId));
  const [saving, setSaving] = useState(false);

  const totalMarks = useMemo(() => questions.reduce((sum, question) => sum + Number(question.marks || 1), 0), [questions]);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        setLoading(true);
        const [courseRes, quizRes] = await Promise.all([
          api.get("/coach/courses"),
          quizId ? api.get(`/coach/quizzes/${quizId}`) : Promise.resolve(null),
        ]);
        if (!alive) return;
        const courseList = courseRes.courses || [];
        setCourses(courseList);
        if (quizRes?.quiz) {
          const quiz = quizRes.quiz;
          setMeta({
            title: quiz.title || "",
            description: quiz.description || "",
            courseId: quiz.courseId || courseList[0]?.id || "",
            passingScore: String(quiz.passingScore || 60),
            status: quiz.status || "published",
          });
          const existingQuestions = (quiz.questionItems || []).map(normalizeQuestion);
          setQuestions(existingQuestions.length ? existingQuestions : [makeQuestion()]);
        } else {
          setMeta((prev) => ({ ...prev, courseId: prev.courseId || courseList[0]?.id || "" }));
        }
      } catch (err) {
        toast.error(err?.message || "Failed to load quiz");
      } finally {
        if (alive) setLoading(false);
      }
    };
    load();
    return () => { alive = false; };
  }, [quizId]);

  const changeMeta = (e) => setMeta((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const changeQuestion = (id, field, value) => setQuestions((prev) => prev.map((question) => question.id === id ? { ...question, [field]: value } : question));
  const changeOption = (id, index, value) => setQuestions((prev) => prev.map((question) => question.id === id ? { ...question, options: question.options.map((option, i) => i === index ? value : option) } : question));
  const addQuestion = () => setQuestions((prev) => [...prev, makeQuestion()]);
  const removeQuestion = (id) => setQuestions((prev) => prev.length === 1 ? prev : prev.filter((question) => question.id !== id));

  const addOption = (id) => setQuestions((prev) => prev.map((question) => question.id === id ? { ...question, options: [...question.options, ""] } : question));
  const removeOption = (id, index) => setQuestions((prev) => prev.map((question) => {
    if (question.id !== id || question.options.length <= 2) return question;
    const nextOptions = question.options.filter((_, i) => i !== index);
    const nextCorrect = Number(question.correct) === index ? 0 : Number(question.correct) > index ? Number(question.correct) - 1 : Number(question.correct);
    return { ...question, options: nextOptions, correct: nextCorrect };
  }));

  const validate = () => {
    if (!meta.courseId || !meta.title.trim()) return "Course and quiz title required";
    if (!questions.length) return "Add at least one question";
    for (const [index, question] of questions.entries()) {
      if (!question.text.trim()) return `Question ${index + 1} text is required`;
      const filledOptions = question.options.map((option) => option.trim()).filter(Boolean);
      if (filledOptions.length < 2) return `Question ${index + 1} needs at least two options`;
      if (question.options.some((option) => !option.trim())) return `Fill all options in question ${index + 1}`;
      if (Number(question.correct) < 0 || Number(question.correct) >= question.options.length) return `Select correct option in question ${index + 1}`;
    }
    return "";
  };

  const submit = async (status = meta.status) => {
    const error = validate();
    if (error) return toast.error(error);
    setSaving(true);
    try {
      const payload = {
        ...meta,
        passingScore: Number(meta.passingScore || 60),
        status,
        questions: questions.map((question, index) => ({
          text: question.text.trim(),
          options: question.options.map((option) => option.trim()),
          correctAnswer: Number(question.correct),
          marks: Number(question.marks || 1),
          sortOrder: index + 1,
        })),
      };
      if (editing) await api.put(`/coach/quizzes/${quizId}`, payload);
      else await api.post("/coach/quizzes", payload);
      toast.success(status === "published" ? "Quiz published" : "Quiz saved as draft");
      navigate("/coach/quizzes");
    } catch (err) {
      toast.error(err?.message || "Quiz save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="rounded-2xl bg-white p-10 text-center text-gray-500 shadow-sm">Loading quiz...</div>;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <button onClick={() => navigate("/coach/quizzes")} className="mb-3 inline-flex items-center gap-2 text-sm font-bold text-indigo-700"><ArrowLeft size={16} /> Back to Quizzes</button>
          <h2 className="text-2xl font-bold text-gray-800">{editing ? "Edit Quiz" : "Create Quiz"}</h2>
          <p className="mt-1 text-sm text-gray-500">Build MCQ performance tests with multiple questions and dynamic answer options.</p>
        </div>
        <div className="rounded-2xl bg-white px-4 py-3 text-sm font-bold text-gray-700 shadow-sm">{questions.length} questions - {totalMarks} marks</div>
      </div>

      <section className="space-y-4 rounded-2xl bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <select name="courseId" value={meta.courseId} onChange={changeMeta} className="rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"><option value="">Select course</option>{courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}</select>
          <input name="title" value={meta.title} onChange={changeMeta} placeholder="Quiz title" className="rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
        </div>
        <textarea name="description" value={meta.description} onChange={changeMeta} rows={3} placeholder="Quiz description" className="w-full resize-none rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="block"><span className="mb-1 block text-xs font-black uppercase text-gray-400">Passing Score (%)</span><input name="passingScore" type="number" min="0" max="100" value={meta.passingScore} onChange={changeMeta} className="w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" /></label>
          <label className="block"><span className="mb-1 block text-xs font-black uppercase text-gray-400">Status</span><select name="status" value={meta.status} onChange={changeMeta} className="w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"><option value="published">Published</option><option value="draft">Draft</option></select></label>
        </div>
      </section>

      <section className="space-y-4">
        {questions.map((question, qIndex) => (
          <article key={question.id} className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-sm font-black text-indigo-700">Q{qIndex + 1}</div>
              <div className="min-w-0 flex-1 space-y-3">
                <textarea value={question.text} onChange={(e) => changeQuestion(question.id, "text", e.target.value)} rows={2} placeholder="Type question here..." className="w-full resize-none rounded-lg border px-3 py-2.5 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-[160px_1fr]">
                  <label className="block"><span className="mb-1 block text-xs font-black uppercase text-gray-400">Marks</span><input type="number" min="1" value={question.marks} onChange={(e) => changeQuestion(question.id, "marks", e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm" /></label>
                  <div className="rounded-xl bg-slate-50 px-4 py-3 text-xs font-bold text-slate-500">Click the option letter to mark the correct answer. Add more options when needed.</div>
                </div>
              </div>
              <button onClick={() => removeQuestion(question.id)} disabled={questions.length === 1} className="rounded-lg p-2 text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40" title="Remove question"><Trash2 size={17} /></button>
            </div>

            <div className="mt-5 space-y-3 pl-0 lg:pl-[52px]">
              {question.options.map((option, index) => {
                const selected = Number(question.correct) === index;
                return (
                  <div key={index} className="flex items-center gap-3">
                    <button onClick={() => changeQuestion(question.id, "correct", index)} className={`h-9 w-9 shrink-0 rounded-full border text-sm font-black ${selected ? "border-green-500 bg-green-500 text-white" : "border-gray-300 bg-white text-gray-500 hover:border-green-400"}`}>{String.fromCharCode(65 + index)}</button>
                    <input value={option} onChange={(e) => changeOption(question.id, index, e.target.value)} placeholder={`Option ${String.fromCharCode(65 + index)}`} className="min-w-0 flex-1 rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                    <button onClick={() => removeOption(question.id, index)} disabled={question.options.length <= 2} className="rounded-lg p-2 text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30" title="Remove option"><Trash2 size={15} /></button>
                  </div>
                );
              })}
              <button onClick={() => addOption(question.id)} className="inline-flex items-center gap-2 rounded-xl border border-dashed border-indigo-300 px-4 py-2 text-sm font-bold text-indigo-700 hover:bg-indigo-50"><Plus size={16} /> Add Option</button>
            </div>
          </article>
        ))}
      </section>

      <button onClick={addQuestion} className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-indigo-300 bg-white py-4 text-sm font-bold text-indigo-700 hover:bg-indigo-50"><Plus size={18} /> Add More Question</button>

      <div className="flex flex-col gap-3 pb-6 sm:flex-row">
        <button onClick={() => submit("draft")} disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-bold text-gray-600 disabled:opacity-60"><Save size={16} /> Save Draft</button>
        <button onClick={() => submit("published")} disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white disabled:opacity-60 sm:ml-auto"><CheckCircle size={16} /> {saving ? "Saving..." : editing ? "Update & Publish" : "Publish Quiz"}</button>
      </div>
    </div>
  );
}