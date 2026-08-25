import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, BookOpen, CheckCircle, ChevronLeft, ChevronRight, ClipboardList, Download, ExternalLink, FileText, HelpCircle, Link as LinkIcon, Paperclip, PlayCircle, Type } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";
import { resolveMediaUrl } from "../../utils/media";
import { getVideoEmbedUrl, isDirectVideoUrl } from "../../utils/video";

const isSubmitted = (submission) => ["submitted", "graded"].includes(submission?.status);
const isQuizPassed = (quiz) => Number(quiz.attempts || 0) > 0 && Number(quiz.avgScore || 0) >= Number(quiz.passingScore || 0);

const assignmentStatusLabel = (status) => {
  if (status === "graded") return "Accepted";
  if (status === "pending") return "Rejected - needs revision";
  if (status === "submitted") return "Submitted for review";
  return "Not submitted";
};

const getLessonIcon = (type) => {
  if (type === "video") return PlayCircle;
  if (type === "document") return FileText;
  if (type === "link") return LinkIcon;
  return Type;
};

const contentLabel = (type) => {
  if (type === "video") return "Video lesson";
  if (type === "document") return "Document lesson";
  if (type === "link") return "External resource";
  return "Text lesson";
};

export default function LearnCourse() {
  const { courseId } = useParams();
  const [lessons, setLessons] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [enrollment, setEnrollment] = useState(null);
  const [activeLessonId, setActiveLessonId] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingProgress, setSavingProgress] = useState(false);

  const sortedLessons = useMemo(
    () => [...lessons].sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0) || new Date(a.createdAt || 0) - new Date(b.createdAt || 0)),
    [lessons]
  );

  const activeLesson = sortedLessons.find((lesson) => lesson.id === activeLessonId) || sortedLessons[0] || null;
  const activeIndex = activeLesson ? sortedLessons.findIndex((lesson) => lesson.id === activeLesson.id) : -1;

  const completedLessons = sortedLessons.filter((lesson) => lesson.progress?.status === "completed").length;
  const submittedAssignments = assignments.filter(({ submission }) => isSubmitted(submission)).length;
  const passedQuizzes = quizzes.filter(isQuizPassed).length;
  const totalItems = sortedLessons.length + assignments.length + quizzes.length;
  const completedItems = completedLessons + submittedAssignments + passedQuizzes;
  const percent = totalItems ? Math.round((completedItems / totalItems) * 100) : Number(enrollment?.progress || 0);

  const chooseDefaultLesson = (items, currentId = activeLessonId) => {
    if (!items.length) return "";
    if (currentId && items.some((lesson) => lesson.id === currentId)) return currentId;
    return items.find((lesson) => lesson.progress?.status !== "completed")?.id || items[0].id;
  };

  const load = async (preferredLessonId = activeLessonId) => {
    try {
      setLoading(true);
      const [contentRes, assignmentRes, quizRes] = await Promise.all([
        api.get(`/student/courses/${courseId}/content`),
        api.get("/student/assignments"),
        api.get("/student/quizzes"),
      ]);
      const lessonList = contentRes.lessons || [];
      setEnrollment(contentRes.enrollment || null);
      setLessons(lessonList);
      setAssignments((assignmentRes.assignments || []).filter((item) => item.assignment?.courseId === courseId));
      setQuizzes((quizRes.quizzes || []).filter((quiz) => quiz.courseId === courseId));
      setActiveLessonId(chooseDefaultLesson(lessonList, preferredLessonId));
    } catch (err) {
      toast.error(err?.message || "Failed to load course content");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { const timer = setTimeout(() => load(""), 0); return () => clearTimeout(timer); }, [courseId]);

  const markComplete = async (lessonId = activeLesson?.id) => {
    if (!lessonId) return;
    setSavingProgress(true);
    try {
      await api.patch(`/student/lessons/${lessonId}/progress`, { status: "completed" });
      toast.success("Lesson completed");
      await load(lessonId);
    } catch (err) {
      toast.error(err?.message || "Progress update failed");
    } finally {
      setSavingProgress(false);
    }
  };

  const goToLesson = (offset) => {
    const next = sortedLessons[activeIndex + offset];
    if (next) setActiveLessonId(next.id);
  };

  if (loading) {
    return <div className="rounded-2xl bg-white p-10 text-center text-slate-500">Loading course...</div>;
  }

  return (
    <div className="space-y-6">
      <Link to="/student/my-learning" className="inline-flex items-center gap-2 text-sm font-semibold text-sky-700"><ArrowLeft size={16} /> Back to My Learning</Link>

      <div className="rounded-2xl bg-slate-900 p-6 text-white">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-bold text-sky-300">Course Progress</p>
            <h2 className="mt-2 text-3xl font-black">{percent}% complete</h2>
            <p className="mt-1 text-sm text-slate-300">{completedItems} of {totalItems || 0} activities completed</p>
          </div>
          <div className="rounded-xl bg-white/10 px-4 py-3 text-sm font-bold text-slate-100">{completedLessons}/{sortedLessons.length} lessons done</div>
        </div>
        <div className="mt-5 h-2 rounded-full bg-white/10"><div className="h-full rounded-full bg-sky-400" style={{ width: `${percent}%` }} /></div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[330px_1fr]">
        <aside className="space-y-5">
          <section className="rounded-2xl bg-white shadow-sm">
            <div className="border-b px-5 py-4"><h3 className="font-black text-slate-900">Curriculum</h3></div>
            {sortedLessons.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-500">No published lessons yet</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {sortedLessons.map((lesson, index) => {
                  const done = lesson.progress?.status === "completed";
                  const Icon = getLessonIcon(lesson.contentType);
                  const active = activeLesson?.id === lesson.id;
                  return (
                    <button key={lesson.id} onClick={() => setActiveLessonId(lesson.id)} className={`flex w-full gap-3 p-4 text-left transition ${active ? "bg-sky-50" : "hover:bg-slate-50"}`}>
                      <span className={`mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${done ? "bg-green-100 text-green-600" : active ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-500"}`}>{done ? <CheckCircle size={18} /> : <Icon size={18} />}</span>
                      <span className="min-w-0 flex-1">
                        <span className="text-xs font-black uppercase text-slate-400">Lesson {index + 1}</span>
                        <span className="mt-1 block font-bold text-slate-900">{lesson.title}</span>
                        <span className="mt-1 block text-xs text-slate-500">{contentLabel(lesson.contentType)} - {lesson.durationMinutes || 0} min</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          <ActivityPanel assignments={assignments} quizzes={quizzes} />
        </aside>

        <main className="space-y-5">
          {activeLesson ? (
            <section className="rounded-2xl bg-white shadow-sm">
              <div className="border-b px-5 py-4">
                <p className="text-xs font-black uppercase text-sky-600">Lesson {activeIndex + 1} - {contentLabel(activeLesson.contentType)}</p>
                <h1 className="mt-1 text-2xl font-black text-slate-900">{activeLesson.title}</h1>
                {activeLesson.description && activeLesson.contentType !== "text" && <p className="mt-2 text-sm text-slate-500">{activeLesson.description}</p>}
              </div>

              <div className="p-5">
                <LessonPlayer lesson={activeLesson} />
              </div>

              <div className="flex flex-col gap-3 border-t p-5 sm:flex-row sm:items-center sm:justify-between">
                <button onClick={() => goToLesson(-1)} disabled={activeIndex <= 0} className="inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold text-slate-700 disabled:opacity-40"><ChevronLeft size={16} /> Previous</button>
                <button onClick={() => markComplete(activeLesson.id)} disabled={savingProgress || activeLesson.progress?.status === "completed"} className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white disabled:bg-green-100 disabled:text-green-700"><CheckCircle size={16} /> {activeLesson.progress?.status === "completed" ? "Completed" : savingProgress ? "Saving..." : "Mark Complete"}</button>
                <button onClick={() => goToLesson(1)} disabled={activeIndex >= sortedLessons.length - 1} className="inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold text-slate-700 disabled:opacity-40">Next <ChevronRight size={16} /></button>
              </div>
            </section>
          ) : (
            <section className="rounded-2xl bg-white p-10 text-center shadow-sm">
              <BookOpen className="mx-auto text-slate-300" size={44} />
              <h3 className="mt-4 font-black text-slate-900">No lessons published yet</h3>
              <p className="mt-1 text-sm text-slate-500">Your coach can add video, document, link, or text lessons from the content builder.</p>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

function LessonPlayer({ lesson }) {
  const rawUrl = lesson.contentUrl || "";
  const url = resolveMediaUrl(rawUrl);
  const embedUrl = getVideoEmbedUrl(rawUrl);

  if (lesson.contentType === "video") {
    if (embedUrl) {
      return <div className="aspect-video overflow-hidden rounded-2xl bg-slate-950"><iframe src={embedUrl} title={lesson.title} className="h-full w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /></div>;
    }
    if (url && isDirectVideoUrl(url)) {
      return <video src={url} controls className="aspect-video w-full rounded-2xl bg-slate-950 object-contain" />;
    }
    return <EmptyContent icon={PlayCircle} title="No playable video attached" url={url} />;
  }

  if (lesson.contentType === "document") {
    if (!url) return <EmptyContent icon={FileText} title="No document attached" />;
    const isImage = /\.(png|jpe?g|webp|gif|bmp|svg)(\?.*)?$/i.test(url);
    return (
      <div className="space-y-3">
        <div className="overflow-hidden rounded-2xl border bg-slate-50">
          {isImage ? <img src={url} alt={lesson.title} className="max-h-[620px] w-full object-contain" /> : <iframe src={url} title={lesson.title} className="h-[620px] w-full" />}
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-sky-50 px-4 py-2 text-sm font-black text-sky-700"><ExternalLink size={16} /> Open</a>
          <a href={url} download className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-sm font-black text-slate-700"><Download size={16} /> Download</a>
        </div>
      </div>
    );
  }

  if (lesson.contentType === "link") {
    return url ? (
      <div className="rounded-2xl border border-dashed p-8 text-center">
        <LinkIcon className="mx-auto text-sky-600" size={44} />
        <h3 className="mt-4 font-black text-slate-900">External learning resource</h3>
        <p className="mt-1 break-all text-sm text-slate-500">{rawUrl}</p>
        <a href={url} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-black text-white"><ExternalLink size={16} /> Open Resource</a>
      </div>
    ) : <EmptyContent icon={LinkIcon} title="No link attached" />;
  }

  return <div className="min-h-[320px] whitespace-pre-wrap rounded-2xl border bg-slate-50 p-6 text-sm leading-7 text-slate-700">{lesson.description || "No text content added."}</div>;
}

function EmptyContent({ icon: Icon, title, url }) {
  return (
    <div className="rounded-2xl border border-dashed p-10 text-center text-slate-500">
      <Icon className="mx-auto text-slate-300" size={44} />
      <p className="mt-3 font-bold text-slate-700">{title}</p>
      {url && <a href={url} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-black text-white"><ExternalLink size={16} /> Open URL</a>}
    </div>
  );
}

function ActivityPanel({ assignments, quizzes }) {
  return (
    <div className="space-y-5">
      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2"><ClipboardList size={18} className="text-sky-600" /><h3 className="font-black text-slate-900">Assignments</h3></div>
        {assignments.length === 0 ? (
          <p className="text-sm text-slate-500">No assignments yet</p>
        ) : (
          <div className="space-y-3">
            {assignments.map(({ assignment, submission }) => {
              const fileUrl = resolveMediaUrl(assignment.attachmentUrl);
              return (
                <div key={assignment.id} className="rounded-xl border p-3 hover:bg-slate-50">
                  <Link to={`/student/assignments/${assignment.id}/submit`} className="block">
                    <p className="font-bold text-slate-900">{assignment.title}</p>
                    <p className="mt-1 text-xs text-slate-500">{submission ? assignmentStatusLabel(submission.status) : "Not submitted"}</p>
                  </Link>
                  {fileUrl && (
                    <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
                      <a href={fileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg bg-sky-50 px-2.5 py-1.5 text-xs font-black text-sky-700"><Paperclip size={13} /> View file</a>
                      <a href={fileUrl} download className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-black text-slate-700"><Download size={13} /> Download</a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2"><HelpCircle size={18} className="text-sky-600" /><h3 className="font-black text-slate-900">Quizzes</h3></div>
        {quizzes.length === 0 ? <p className="text-sm text-slate-500">No quizzes yet</p> : <div className="space-y-3">{quizzes.map((quiz) => <Link key={quiz.id} to={`/student/quizzes/${quiz.id}/attempt`} className="block rounded-xl border p-3 hover:bg-slate-50"><p className="font-bold text-slate-900">{quiz.title}</p><p className="mt-1 text-xs text-slate-500">{quiz.questions || 0} questions - pass {quiz.passingScore}%</p></Link>)}</div>}
      </section>
    </div>
  );
}