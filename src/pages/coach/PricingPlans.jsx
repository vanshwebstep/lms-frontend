import { useEffect, useState } from "react";
import { Check, Edit2, Plus, Shield, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";
import { confirmDialog } from "../../utils/dialogs";

export default function PricingPlans() {
  const [courses, setCourses] = useState([]);
  const [plans, setPlans] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editPlan, setEditPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const [courseRes, planRes] = await Promise.all([api.get("/coach/courses"), api.get("/coach/pricing-plans")]);
      setCourses(courseRes.courses || []);
      setPlans(planRes.plans || []);
    } catch (err) {
      toast.error(err?.message || "Failed to load plans");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const remove = async (id) => {
    const ok = await confirmDialog({ title: "Delete pricing plan?", message: "This pricing plan will no longer be available.", confirmText: "Delete Plan", tone: "danger" });
    if (!ok) return;
    try {
      await api.delete(`/coach/pricing-plans/${id}`);
      toast.success("Plan deleted");
      load();
    } catch (err) {
      toast.error(err?.message || "Delete failed");
    }
  };

  return <div className="space-y-6"><div className="flex items-center justify-between"><div><h2 className="text-2xl font-bold text-gray-800">Pricing Plans</h2><p className="mt-1 text-sm text-gray-500">Course access plans stored in backend settings.</p></div><button onClick={() => { setEditPlan(null); setShowModal(true); }} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white"><Plus size={18} /> Add Plan</button></div>{loading ? <div className="rounded-2xl bg-white p-10 text-center text-gray-400">Loading plans...</div> : plans.length === 0 ? <div className="rounded-2xl bg-white p-10 text-center text-gray-400">No pricing plans yet</div> : <div className="grid grid-cols-1 gap-5 md:grid-cols-3">{plans.map((plan) => <div key={plan.id} className={`overflow-hidden rounded-2xl border-2 bg-white shadow-sm ${plan.popular ? "border-indigo-500" : "border-transparent"}`}>{plan.popular && <div className="bg-indigo-600 py-1.5 text-center text-xs font-semibold text-white">MOST POPULAR</div>}<div className="space-y-4 p-5"><div className="flex items-start justify-between"><div><h3 className="text-lg font-bold text-gray-800">{plan.name}</h3><p className="mt-0.5 text-xs text-gray-500">{plan.courseTitle || courses.find((c) => c.id === plan.courseId)?.title || "Course plan"}</p></div><div className="flex gap-1"><button onClick={() => { setEditPlan(plan); setShowModal(true); }} className="rounded-lg p-1.5 hover:bg-indigo-50"><Edit2 size={14} className="text-indigo-500" /></button><button onClick={() => remove(plan.id)} className="rounded-lg p-1.5 hover:bg-red-50"><Trash2 size={14} className="text-red-500" /></button></div></div><div><span className="text-3xl font-extrabold text-gray-800">Rs {plan.price}</span><p className="text-sm text-gray-500">{plan.duration} days access</p></div><ul className="space-y-2">{(plan.features || []).map((feature, index) => <li key={index} className="flex items-center gap-2 text-sm text-gray-600"><Check size={15} className="text-green-500" />{feature}</li>)}</ul><div className="border-t pt-2 text-xs font-medium text-green-600"><Shield size={13} className="mr-1 inline" />{plan.status || "active"}</div></div></div>)}</div>}{showModal && <PlanModal plan={editPlan} courses={courses} onClose={() => setShowModal(false)} onSaved={() => { setShowModal(false); load(); }} />}</div>;
}

function PlanModal({ plan, courses, onClose, onSaved }) {
  const [form, setForm] = useState({ courseId: plan?.courseId || courses[0]?.id || "", name: plan?.name || "", price: plan?.price || "", duration: plan?.duration || "30", popular: Boolean(plan?.popular), features: plan?.features?.join("\n") || "", status: plan?.status || "active" });
  const [saving, setSaving] = useState(false);
  const change = (e) => { const { name, value, type, checked } = e.target; setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value })); };
  const submit = async () => {
    if (!form.name || !form.price) return toast.error("Name and price required");
    setSaving(true);
    try {
      const course = courses.find((item) => item.id === form.courseId);
      const payload = { ...form, courseTitle: course?.title || "", price: Number(form.price), duration: Number(form.duration || 30), features: form.features.split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean) };
      if (plan) await api.put(`/coach/pricing-plans/${plan.id}`, payload); else await api.post("/coach/pricing-plans", payload);
      toast.success(plan ? "Plan updated" : "Plan created");
      onSaved();
    } catch (err) {
      toast.error(err?.message || "Plan save failed");
    } finally {
      setSaving(false);
    }
  };
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"><div className="w-full max-w-md rounded-2xl bg-white shadow-xl"><div className="flex items-center justify-between border-b px-6 py-4"><h3 className="font-semibold text-gray-800">{plan ? "Edit Plan" : "Create Plan"}</h3><button onClick={onClose} className="text-xl text-gray-400">&times;</button></div><div className="space-y-4 p-6"><select name="courseId" value={form.courseId} onChange={change} className="w-full rounded-lg border px-3 py-2.5 text-sm"><option value="">Select course</option>{courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}</select><div className="grid grid-cols-2 gap-3"><input name="name" value={form.name} onChange={change} placeholder="Plan name" className="rounded-lg border px-3 py-2.5 text-sm" /><input name="price" type="number" value={form.price} onChange={change} placeholder="Price" className="rounded-lg border px-3 py-2.5 text-sm" /></div><input name="duration" type="number" value={form.duration} onChange={change} placeholder="Duration days" className="w-full rounded-lg border px-3 py-2.5 text-sm" /><textarea name="features" value={form.features} onChange={change} rows={4} placeholder="Features, one per line" className="w-full resize-none rounded-lg border px-3 py-2.5 text-sm" /><label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" name="popular" checked={form.popular} onChange={change} /> Mark popular</label></div><div className="flex gap-3 px-6 pb-5"><button onClick={onClose} className="flex-1 rounded-xl border py-2.5 text-sm text-gray-600">Cancel</button><button onClick={submit} disabled={saving} className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-sm font-medium text-white disabled:opacity-60">{saving ? "Saving..." : "Save"}</button></div></div></div>;
}
