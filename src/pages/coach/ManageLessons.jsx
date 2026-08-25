import { useEffect, useMemo, useState } from "react";
import { BookOpen, CheckCircle, Edit2, ExternalLink, FileText, Film, Link as LinkIcon, Plus, Search, Trash2, Type, Upload, X } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";
import { confirmDialog } from "../../utils/dialogs";
import { resolveMediaUrl } from "../../utils/media";

const emptyForm = {
  courseId: "",
  title: "",
  description: "",
  contentType: "video",
  contentUrl: "",
  contentFile: null,
  durationMinutes: "0",
  sortOrder: "1",
  status: "published",
  isPreview: false,
};

const typeConfig = {
  video: { label: "Video", icon: Film, help: "Upload MP4/WebM/Ogg or paste a video link." },
  document: { label: "Document", icon: FileText, help: "Upload PDF/DOC/PPT/ZIP or paste a document URL." },
  link: { label: "External Link", icon: LinkIcon, help: "Paste any external learning link." },
  text: { label: "Text Lesson", icon: Type, help: "Use description as the lesson content." },
};

const fileEndpoint = (type) => type === "video" ? "/upload/video" : "/upload/document";
const canUpload = (type) => ["video", "document"].includes(type);
const sortedLessons = (items) => [...items].sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0) || new Date(a.createdAt || 0) - new Date(b.createdAt || 0));

export default function ManageLessons() {
  const [courses, setCourses] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = async (preferredCourse = selectedCourse) => {
    try {
      setLoading(true);
      const [courseRes, lessonRes] = await Promise.all([api.get("/coach/courses"), api.get("/coach/lessons")]);
      const courseList = courseRes.courses || [];
      const lessonList = lessonRes.lessons || [];
      setCourses(courseList);
      setLessons(lessonList);
      setSelectedCourse((current) => preferredCourse || current || courseList[0]?.id || "");
    } catch (err) {
      toast.error(err?.message || "Failed to load course content");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const activeCourse = courses.find((course) => course.id === selectedCourse) || courses[0] || null;
  const activeCourseId = activeCourse?.id || selectedCourse;
  const courseLessons = useMemo(() => sortedLessons(lessons.filter((lesson) => !activeCourseId || lesson.courseId === activeCourseId)), [lessons, activeCourseId]);
  const filtered = useMemo(() => courseLessons.filter((lesson) => `${lesson.title} ${lesson.description} ${lesson.contentType}`.toLowerCase().includes(search.toLowerCase())), [courseLessons, search]);
  const published = courseLessons.filter((lesson) => lesson.status === "published").length;
  const totalMinutes = courseLessons.reduce((sum, lesson) => sum + Number(lesson.durationMinutes || 0), 0);

  const openCreate = () => {
    setEditing(null);
    setShowModal(true);
  };

  const openEdit = (lesson) => {
    setEditing(lesson);
    setShowModal(true);
  };

  const remove = async (lesson) => {
    const ok = await confirmDialog({ title: "Delete lesson?", message: `${lesson.title} will be removed from this course.`, confirmText: "Delete Lesson", tone: "danger" });
    if (!ok) return;
    try {
      await api.delete(`/coach/lessons/${lesson.id}`);
      toast.success("Lesson deleted");
      load(activeCourseId);
    } catch (err) {
      toast.error(err?.message || "Delete failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Course Content Builder</h2>
          <p className="mt-1 text-sm text-gray-500">Build LMS lessons in order with video, documents, links, and text content.</p>
        </div>
        <button onClick={openCreate} disabled={!activeCourse} className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-60"><Plus size={18} /> Add Lesson</button>
      </div>

      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_260px]">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search lessons..." className="w-full rounded-lg border py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
          </div>
          <select value={activeCourseId || ""} onChange={(e) => setSelectedCourse(e.target.value)} className="rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
            {courses.length === 0 && <option value="">No courses yet</option>}
            {courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
          </select>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[{ label: "Lessons", value: courseLessons.length }, { label: "Published", value: published }, { label: "Duration", value: `${totalMinutes} min` }].map((item) => <div key={item.label} className="rounded-2xl bg-white p-5 shadow-sm"><p className="text-sm font-bold text-gray-500">{item.label}</p><p className="mt-2 text-3xl font-black text-gray-900">{item.value}</p></div>)}
      </section>

      <section className="rounded-2xl bg-white shadow-sm">
        <div className="border-b px-5 py-4">
          <h3 className="font-black text-gray-900">{activeCourse?.title || "Course"} Curriculum</h3>
        </div>
        {loading ? (
          <div className="p-10 text-center text-gray-400">Loading lessons...</div>
        ) : !activeCourse ? (
          <div className="p-10 text-center text-gray-400">Create a course first, then add lessons.</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-gray-400">No lessons found. Add the first lesson to start the LMS flow.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map((lesson, index) => {
              const config = typeConfig[lesson.contentType] || typeConfig.video;
              const Icon = config.icon;
              const contentUrl = resolveMediaUrl(lesson.contentUrl);
              return (
                <article key={lesson.id} className="grid gap-4 p-5 lg:grid-cols-[52px_1fr_auto] lg:items-start">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><Icon size={20} /></div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-black text-slate-500">Lesson {index + 1}</span>
                      {lesson.isPreview && <span className="rounded-full bg-sky-50 px-2 py-1 text-xs font-black text-sky-700">Free preview</span>}
                      <span className={`rounded-full px-2 py-1 text-xs font-black ${lesson.status === "published" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>{lesson.status}</span>
                    </div>
                    <h4 className="mt-2 font-black text-gray-900">{lesson.title}</h4>
                    <p className="mt-1 line-clamp-2 text-sm text-gray-500">{lesson.description || config.help}</p>
                    <div className="mt-3 flex flex-wrap gap-3 text-xs font-bold text-gray-500"><span>{config.label}</span><span>{lesson.durationMinutes || 0} min</span><span>Order {lesson.sortOrder || index + 1}</span>{contentUrl && <a href={contentUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-indigo-700"><ExternalLink size={13} /> Open content</a>}</div>
                  </div>
                  <div className="flex gap-2 lg:justify-end"><button onClick={() => openEdit(lesson)} className="rounded-lg border p-2 text-indigo-600 hover:bg-indigo-50" title="Edit"><Edit2 size={15} /></button><button onClick={() => remove(lesson)} className="rounded-lg border border-red-100 p-2 text-red-600 hover:bg-red-50" title="Delete"><Trash2 size={15} /></button></div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {showModal && <LessonModal courses={courses} defaultCourseId={activeCourseId} lesson={editing} onClose={() => setShowModal(false)} onSaved={() => { setShowModal(false); load(activeCourseId); }} />}
    </div>
  );
}

function LessonModal({ courses, defaultCourseId, lesson, onClose, onSaved }) {
  const [form, setForm] = useState(() => lesson ? { ...emptyForm, ...lesson, durationMinutes: String(lesson.durationMinutes || 0), sortOrder: String(lesson.sortOrder || 1), contentFile: null } : { ...emptyForm, courseId: defaultCourseId || courses[0]?.id || "", sortOrder: "1" });
  const [saving, setSaving] = useState(false);

  const change = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value, ...(name === "contentType" ? { contentFile: null, contentUrl: value === "text" ? "" : prev.contentUrl } : {}) }));
  };

  const uploadContentFile = async () => {
    if (!form.contentFile) return form.contentUrl || "";
    const data = new FormData();
    data.append("file", form.contentFile);
    const res = await api.post(fileEndpoint(form.contentType), data, { headers: { "Content-Type": "multipart/form-data" } });
    return res.upload?.url || res.material?.url || "";
  };

  const submit = async () => {
    if (!form.courseId || !form.title.trim()) return toast.error("Course and lesson title required");
    if (form.contentType !== "text" && !form.contentUrl && !form.contentFile) return toast.error("Add a content URL or upload a file");
    if (form.contentFile && form.contentType === "video" && !form.contentFile.type?.startsWith("video/")) return toast.error("Upload a valid video file");
    setSaving(true);
    try {
      const contentUrl = await uploadContentFile();
      const payload = { ...form, contentUrl, durationMinutes: Number(form.durationMinutes || 0), sortOrder: Number(form.sortOrder || 0), contentFile: undefined };
      if (lesson) await api.put(`/coach/lessons/${lesson.id}`, payload); else await api.post("/coach/lessons", payload);
      toast.success(lesson ? "Lesson updated" : "Lesson created");
      onSaved();
    } catch (err) {
      toast.error(err?.message || "Lesson save failed");
    } finally {
      setSaving(false);
    }
  };

  const config = typeConfig[form.contentType] || typeConfig.video;
  const accept = form.contentType === "video" ? "video/*" : ".pdf,.doc,.docx,.ppt,.pptx,.zip,.jpg,.jpeg,.png,.webp,application/pdf";

  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"><div className="max-h-[92vh] w-full max-w-2xl overflow-auto rounded-2xl bg-white shadow-xl"><div className="flex items-center justify-between border-b px-6 py-4"><div><h3 className="font-black text-gray-900">{lesson ? "Edit Lesson" : "Add Lesson"}</h3><p className="text-sm text-gray-500">{config.help}</p></div><button onClick={onClose} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100"><X size={18} /></button></div><div className="space-y-4 p-6"><select name="courseId" value={form.courseId} onChange={change} className="w-full rounded-lg border px-3 py-2.5 text-sm"><option value="">Select course</option>{courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}</select><input name="title" value={form.title} onChange={change} placeholder="Lesson title" className="w-full rounded-lg border px-3 py-2.5 text-sm" /><textarea name="description" value={form.description || ""} onChange={change} rows={4} placeholder={form.contentType === "text" ? "Write the lesson content here..." : "Lesson summary or instructions"} className="w-full resize-none rounded-lg border px-3 py-2.5 text-sm" /><div className="grid grid-cols-1 gap-3 sm:grid-cols-3"><select name="contentType" value={form.contentType} onChange={change} className="rounded-lg border px-3 py-2.5 text-sm"><option value="video">Video</option><option value="document">Document</option><option value="link">External Link</option><option value="text">Text Lesson</option></select><input name="durationMinutes" type="number" value={form.durationMinutes} onChange={change} placeholder="Duration" className="rounded-lg border px-3 py-2.5 text-sm" /><input name="sortOrder" type="number" value={form.sortOrder} onChange={change} placeholder="Order" className="rounded-lg border px-3 py-2.5 text-sm" /></div>{form.contentType !== "text" && <input name="contentUrl" value={form.contentUrl || ""} onChange={change} placeholder="Paste content URL or upload file below" className="w-full rounded-lg border px-3 py-2.5 text-sm" />}{canUpload(form.contentType) && <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-300 p-4 hover:border-indigo-400 hover:bg-indigo-50/40"><Upload size={20} className="text-indigo-600" /><span className="min-w-0 flex-1"><span className="block text-sm font-bold text-slate-800">{form.contentFile ? form.contentFile.name : form.contentUrl ? "Replace uploaded lesson file" : `Upload ${config.label.toLowerCase()} file`}</span><span className="text-xs text-slate-400">{form.contentType === "video" ? "MP4, WebM, Ogg" : "PDF, DOC, PPT, ZIP, image"}</span></span><input type="file" accept={accept} className="hidden" onChange={(e) => setForm((prev) => ({ ...prev, contentFile: e.target.files?.[0] || null }))} /></label>}<div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><select name="status" value={form.status} onChange={change} className="rounded-lg border px-3 py-2.5 text-sm"><option value="published">Published</option><option value="draft">Draft</option><option value="archived">Archived</option></select><label className="flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm text-gray-700"><input type="checkbox" name="isPreview" checked={Boolean(form.isPreview)} onChange={change} /> Free preview</label></div></div><div className="flex gap-3 px-6 pb-5"><button onClick={onClose} className="flex-1 rounded-xl border py-2.5 text-sm text-gray-600">Cancel</button><button onClick={submit} disabled={saving} className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-sm font-bold text-white disabled:opacity-60">{saving ? "Saving..." : "Save Lesson"}</button></div></div></div>;
}