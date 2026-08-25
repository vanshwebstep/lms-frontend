import { useEffect, useMemo, useState } from "react";
import { Edit2, Plus, Search, Trash2, Users, X } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";
import { formatCurrency } from "../../utils/formatters";
import { confirmDialog, selectDialog } from "../../utils/dialogs";
import { resolveMediaUrl } from "../../utils/media";

const emptyForm = { name: "", email: "", password: "password123", title: "Course Coach", status: "active", phone: "", city: "", expertise: "" };

export default function ManageCoaches() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/coaches");
      setRows(res.coaches || []);
    } catch (err) {
      toast.error(err?.message || "Failed to load coaches");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => rows.filter((r) => `${r.name} ${r.email}`.toLowerCase().includes(q.toLowerCase())), [rows, q]);
  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowForm(true); };
  const openEdit = (coach) => {
    setEditing(coach);
    setShowForm(true);
    setForm({
      name: coach.name || "",
      email: coach.email || "",
      password: "",
      title: coach.title || "Course Coach",
      status: coach.status || "active",
      phone: coach.profile?.phone || "",
      city: coach.profile?.city || "",
      expertise: coach.profile?.expertise || "",
    });
  };
  const closeForm = () => { setShowForm(false); setEditing(null); setForm(emptyForm); };
  const change = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return toast.error("Name and email are required");
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        title: form.title,
        status: form.status,
        profile: { phone: form.phone, city: form.city, expertise: form.expertise },
        ...(form.password ? { password: form.password } : {}),
      };
      if (editing) await api.put(`/admin/coaches/${editing.id}`, payload);
      else await api.post("/admin/coaches", payload);
      toast.success(editing ? "Coach updated" : "Coach created");
      closeForm();
      await load();
    } catch (err) {
      toast.error(err?.message || "Failed to save coach");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (coach) => {
    const hasSoldCourses = Number(coach.stats?.students || 0) > 0 || Number(coach.stats?.revenue || 0) > 0;
    const transferOptions = rows.filter((row) => row.id !== coach.id && row.status === "active");
    let transferToCoachId = null;

    if (hasSoldCourses) {
      if (!transferOptions.length) {
        toast.error("This coach has sold courses. Create another active coach first, then transfer courses before deleting.");
        return;
      }

      transferToCoachId = await selectDialog({
        title: "Transfer coach courses",
        message: `${coach.name}'s courses, students, and revenue must be assigned to another active coach before deletion.`,
        options: transferOptions.map((item) => ({ value: item.id, label: item.name, description: item.email })),
      });
      if (!transferToCoachId) return;

      const target = transferOptions.find((item) => item.id === transferToCoachId);
      const confirmed = await confirmDialog({
        title: "Delete coach after transfer?",
        message: `${coach.name}'s courses, students, and revenue will be assigned to ${target?.name || "the selected coach"}.`,
        confirmText: "Transfer and Delete",
        tone: "danger",
      });
      if (!confirmed) return;
    } else {
      const ok = await confirmDialog({
        title: "Delete coach?",
        message: `${coach.name} will be deleted. Unsold courses linked to this coach will also be removed.`,
        confirmText: "Delete Coach",
        tone: "danger",
      });
      if (!ok) return;
    }

    try {
      const res = await api.delete(`/admin/coaches/${coach.id}`, { data: transferToCoachId ? { transferToCoachId } : {} });
      toast.success(res.transferred ? `Coach deleted. Courses assigned to ${res.transferToCoachName}.` : "Coach deleted");
      await load();
    } catch (err) {
      if (err?.details?.transferRequired && err.details.availableCoaches?.length) {
        toast.error("Select a transfer coach before deleting");
      } else if (err?.details?.transferRequired) {
        toast.error("This coach has sold courses and no other active coach is available for transfer.");
      } else {
        toast.error(err?.message || "Failed to delete coach");
      }
    }
  };

  return <div className="space-y-6"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-2xl font-bold text-slate-900">Coaches</h2><p className="mt-1 text-sm text-slate-500">Admin-created platform coaches</p></div><button onClick={openCreate} className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800"><Plus size={16} /> Add Coach</button></div>{showForm && <form onSubmit={save} className="rounded-2xl bg-white p-5 shadow-sm"><div className="mb-4 flex items-center justify-between"><h3 className="font-black text-slate-900">{editing ? "Edit Coach" : "Add Coach"}</h3><button type="button" onClick={closeForm} className="rounded-lg p-2 hover:bg-slate-100"><X size={16} /></button></div><div className="grid grid-cols-1 gap-4 md:grid-cols-3"><input name="name" value={form.name} onChange={change} placeholder="Coach name" className="rounded-lg border px-3 py-2.5 text-sm" /><input name="email" value={form.email} onChange={change} placeholder="Email" className="rounded-lg border px-3 py-2.5 text-sm" /><input name="password" value={form.password} onChange={change} placeholder={editing ? "New password optional" : "Password"} className="rounded-lg border px-3 py-2.5 text-sm" /><input name="title" value={form.title} onChange={change} placeholder="Title" className="rounded-lg border px-3 py-2.5 text-sm" /><select name="status" value={form.status} onChange={change} className="rounded-lg border px-3 py-2.5 text-sm"><option value="active">Active</option><option value="blocked">Blocked</option><option value="pending">Pending</option></select><input name="phone" value={form.phone} onChange={change} placeholder="Phone" className="rounded-lg border px-3 py-2.5 text-sm" /><input name="city" value={form.city} onChange={change} placeholder="City" className="rounded-lg border px-3 py-2.5 text-sm" /><input name="expertise" value={form.expertise} onChange={change} placeholder="Expertise" className="rounded-lg border px-3 py-2.5 text-sm md:col-span-2" /></div><div className="mt-4 flex justify-end"><button disabled={saving} className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60">{saving ? "Saving..." : editing ? "Update Coach" : "Create Coach"}</button></div></form>}<div className="rounded-2xl bg-white p-4 shadow-sm"><div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search coaches..." className="w-full rounded-lg border px-9 py-2 text-sm" /></div></div><div className="overflow-hidden rounded-2xl bg-white shadow-sm"><table className="w-full text-sm"><thead className="bg-slate-50"><tr>{["Name", "Email", "Status", "Courses", "Students", "Revenue", "Actions"].map((c) => <th key={c} className="px-5 py-3 text-left text-xs font-bold uppercase text-slate-500">{c}</th>)}</tr></thead><tbody className="divide-y">{loading ? <tr><td colSpan={7} className="py-10 text-center text-slate-400">Loading...</td></tr> : filtered.length === 0 ? <tr><td colSpan={7} className="py-10 text-center text-slate-400"><Users className="mx-auto mb-2" />No coaches found</td></tr> : filtered.map((coach) => <tr key={coach.id} className="hover:bg-slate-50"><td className="px-5 py-3"><div className="flex items-center gap-3"><div className="h-9 w-9 overflow-hidden rounded-full bg-slate-100 text-xs font-black text-slate-500">{resolveMediaUrl(coach.avatar) ? <img src={resolveMediaUrl(coach.avatar)} alt={coach.name} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center">{(coach.name || "C")[0]}</div>}</div><span className="font-semibold text-slate-900">{coach.name}</span></div></td><td className="px-5 py-3 text-slate-600">{coach.email}</td><td className="px-5 py-3 text-slate-600">{coach.status}</td><td className="px-5 py-3 text-slate-600">{coach.stats?.courses ?? 0}</td><td className="px-5 py-3 text-slate-600">{coach.stats?.students ?? 0}</td><td className="px-5 py-3 font-semibold text-slate-900">{formatCurrency(coach.stats?.revenue ?? 0)}</td><td className="px-5 py-3"><div className="flex gap-2"><button onClick={() => openEdit(coach)} className="rounded-lg border p-2 text-slate-600 hover:bg-slate-50" title="Edit coach"><Edit2 size={15} /></button><button onClick={() => remove(coach)} className="rounded-lg border border-red-100 p-2 text-red-600 hover:bg-red-50" title="Delete coach"><Trash2 size={15} /></button></div></td></tr>)}</tbody></table></div></div>;
}