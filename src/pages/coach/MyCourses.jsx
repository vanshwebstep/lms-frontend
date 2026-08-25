import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PlusCircle, Search, Filter, BookOpen, Users, Edit2, Eye, MoreVertical } from "lucide-react";
import api from "../../services/api";
import { formatCurrency } from "../../utils/formatters";
import CourseMedia from "../../components/common/CourseMedia";

const statuses = ["All", "published", "draft", "archived"];

export default function MyCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");
  const [menuOpen, setMenuOpen] = useState(null);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        setLoading(true);
        const res = await api.get("/coach/courses");
        if (alive) setCourses(res.courses || []);
      } catch (err) {
        if (alive) setError(err?.message || "Failed to load courses");
      } finally {
        if (alive) setLoading(false);
      }
    };
    load();
    return () => { alive = false; };
  }, []);

  const categories = useMemo(() => ["All", ...new Set(courses.map((c) => c.category).filter(Boolean))], [courses]);

  const filtered = courses.filter((course) => {
    const matchSearch = course.title?.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === "All" || course.category === category;
    const matchStatus = status === "All" || course.status === status;
    return matchSearch && matchCategory && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">My Courses</h2>
          <p className="text-sm text-gray-500 mt-1">{loading ? "Loading courses..." : `${filtered.length} course(s) found`}</p>
        </div>
        <Link to="/coach/create-course" className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 transition">
          <PlusCircle size={18} /> Create Course
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search courses..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-400" />
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
            {categories.map((item) => <option key={item}>{item}</option>)}
          </select>
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
          {statuses.map((item) => <option key={item} value={item}>{item === "All" ? "All" : item[0].toUpperCase() + item.slice(1)}</option>)}
        </select>
      </div>

      {error && <div className="bg-red-50 text-red-600 border border-red-100 rounded-xl px-4 py-3 text-sm">{error}</div>}

      {loading ? (
        <div className="bg-white rounded-2xl shadow-sm p-10 text-center text-gray-500">Loading courses...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
          <BookOpen size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">No courses found</p>
          <p className="text-gray-400 text-sm mt-1">Create a course or adjust filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((course) => (
            <div key={course.id} className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-36 overflow-hidden bg-gradient-to-br from-indigo-100 to-sky-100">
                <CourseMedia course={course} compact />

              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-gray-800 text-sm leading-tight">{course.title}</h3>
                  <div className="relative">
                    <button onClick={() => setMenuOpen(menuOpen === course.id ? null : course.id)} className="p-1 hover:bg-gray-100 rounded">
                      <MoreVertical size={16} className="text-gray-500" />
                    </button>
                    {menuOpen === course.id && (
                      <div className="absolute right-0 mt-1 w-36 bg-white border rounded-lg shadow-lg z-10">
                        <Link to={`/coach/edit-course/${course.id}`} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setMenuOpen(null)}><Edit2 size={14} /> Edit</Link>
                        <Link to={`/coach/course-detail/${course.id}`} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setMenuOpen(null)}><Eye size={14} /> View</Link>
                      </div>
                    )}
                  </div>
                </div>
                <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">{course.category}</span>
                <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><Users size={13} /> {course.students || 0} students</span>
                  <span className="flex items-center gap-1"><BookOpen size={13} /> {course.difficulty}</span>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t">
                  <span className="font-bold text-indigo-600">{formatCurrency(course.price || 0, course.currency || "INR")}</span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${course.status === "published" ? "bg-green-100 text-green-600" : "bg-yellow-100 text-yellow-600"}`}>{course.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}