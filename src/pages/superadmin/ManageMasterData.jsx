import { useEffect, useMemo, useState } from "react";
import { Edit2, Layers3, Plus, Search, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";

const tabs = [
  { type: "category", key: "categories", label: "Categories" },
  { type: "difficulty", key: "difficulties", label: "Difficulty Levels" },
  { type: "language", key: "languages", label: "Languages" },
];

const emptyForm = { name: "", status: "active" };

const creatorLabel = (option) => {
  if (option.createdBy?.name) return `${option.createdBy.name} (${option.createdBy.role || option.creatorRole})`;
  if (option.creatorRole === "system") return "System defaults";
  return option.creatorRole || "-";
};

export default function ManageMasterData() {
  const [activeTab, setActiveTab] = useState("category");
  const [data, setData] = useState({ categories: [], difficulties: [], languages: [] });
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const active = tabs.find((tab) => tab.type === activeTab) || tabs[0];
  const rows = data[active.key] || [];
  const filtered = useMemo(() => rows.filter((item) => `${item.name} ${creatorLabel(item)} ${item.status}`.toLowerCase().includes(q.toLowerCase())), [rows, q]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/master-data");
      setData({ categories: res.categories || [], difficulties: res.difficulties || [], languages: res.languages || [] });
    } catch (err) {
      toast.error(err?.message || "Failed to load master data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const reset = () => {
    setEditing(null);
    setForm(emptyForm);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({ name: item.name || "", status: item.status || "active" });
  };

  const save = async (event) => {
    event.preventDefault();
    if (!form.name.trim()) return toast.error("Name is required");
    setSaving(true);
    try {
      if (editing) await api.put(`/admin/master-data/${activeTab}/${editing.id}`, form);
      else await api.post(`/admin/master-data/${activeTab}`, form);
      toast.success(editing ? "Value updated" : "Value created");
      reset();
      await load();
    } catch (err) {
      toast.error(err?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (item) => {
    if (!window.confirm(`Delete ${item.name}? Existing courses will keep this text value.`)) return;
    try {
      await api.delete(`/admin/master-data/${activeTab}/${item.id}`);
      toast.success("Value deleted");
      await load();
      if (editing?.id === item.id) reset();
    } catch (err) {
      toast.error(err?.message || "Delete failed");
    }
  };

  return <div className="space-y-6"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-2xl font-bold text-slate-900">Course Master Data</h2><p className="mt-1 text-sm text-slate-500">Manage categories, difficulty levels, and languages used by courses.</p></div><div className="inline-flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm">{tabs.map((tab) => <button key={tab.type} onClick={() => { setActiveTab(tab.type); reset(); }} className={`rounded-md px-3 py-2 text-sm font-bold ${activeTab === tab.type ? "bg-slate-950 text-white" : "text-slate-500 hover:bg-slate-50"}`}>{tab.label}</button>)}</div></div><form onSubmit={save} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-4 flex items-center justify-between"><h3 className="flex items-center gap-2 font-black text-slate-900"><Layers3 size={18} className="text-emerald-600" /> {editing ? `Edit ${active.label}` : `Add ${active.label}`}</h3>{editing && <button type="button" onClick={reset} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X size={16} /></button>}</div><div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_180px_auto]"><input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder={`Enter ${active.label.toLowerCase()} name`} className="rounded-lg border px-3 py-2.5 text-sm" /><select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))} className="rounded-lg border px-3 py-2.5 text-sm"><option value="active">Active</option><option value="inactive">Inactive</option></select><button disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"><Plus size={16} /> {saving ? "Saving..." : editing ? "Update" : "Add"}</button></div></form><div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"><div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${active.label.toLowerCase()}...`} className="w-full rounded-lg border px-9 py-2 text-sm" /></div></div><div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-sm"><thead className="bg-slate-50"><tr>{["Name", "Status", "Created By", "Used Courses", "Created", "Actions"].map((h) => <th key={h} className="px-5 py-3 text-left text-xs font-bold uppercase text-slate-500">{h}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{loading ? <tr><td colSpan={6} className="px-5 py-10 text-center text-slate-400">Loading...</td></tr> : filtered.length === 0 ? <tr><td colSpan={6} className="px-5 py-10 text-center text-slate-400">No values found</td></tr> : filtered.map((item) => <tr key={item.id} className="hover:bg-slate-50"><td className="px-5 py-3 font-black text-slate-900">{item.name}</td><td className="px-5 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${item.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{item.status}</span></td><td className="px-5 py-3 text-slate-600">{creatorLabel(item)}</td><td className="px-5 py-3 font-semibold text-slate-700">{item.usedCourses || 0}</td><td className="px-5 py-3 text-slate-500">{item.createdAt ? new Date(item.createdAt).toLocaleDateString("en-IN") : "-"}</td><td className="px-5 py-3"><div className="flex gap-2"><button type="button" onClick={() => openEdit(item)} className="rounded-lg border p-2 text-slate-600 hover:bg-slate-50" title="Edit"><Edit2 size={15} /></button><button type="button" onClick={() => remove(item)} className="rounded-lg border border-red-100 p-2 text-red-600 hover:bg-red-50" title="Delete"><Trash2 size={15} /></button></div></td></tr>)}</tbody></table></div></div></div>;
}