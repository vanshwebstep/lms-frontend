import { useEffect, useRef, useState } from "react";
import { Bell, Camera, Eye, EyeOff, Lock, Save, Trash2, User } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { formatDateTime } from "../../utils/formatters";
import { resolveMediaUrl } from "../../utils/media";

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "security", label: "Security", icon: Lock },
  { id: "notifications", label: "Notifications", icon: Bell },
];

export default function AccountSettings({ title = "Settings", subtitle = "Manage your account" }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div><h2 className="text-2xl font-bold text-gray-800">{title}</h2><p className="mt-1 text-sm text-gray-500">{subtitle}</p></div>
      <div className="flex w-fit gap-2 rounded-2xl bg-white p-1.5 shadow-sm">{tabs.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => setActiveTab(id)} className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${activeTab === id ? "bg-indigo-600 text-white shadow" : "text-gray-500 hover:text-indigo-600"}`}><Icon size={16} /> {label}</button>)}</div>
      {activeTab === "profile" && <ProfileTab user={user} />}
      {activeTab === "security" && <SecurityTab />}
      {activeTab === "notifications" && <NotificationsTab />}
    </div>
  );
}

function ProfileTab({ user }) {
  const { updateUser } = useAuth();
  const inputRef = useRef(null);
  const [form, setForm] = useState({
    name: user?.name || "",
    title: user?.title || "",
    phone: user?.profile?.phone || "",
    city: user?.profile?.city || "",
    bio: user?.profile?.bio || "",
    expertise: user?.profile?.expertise || "",
    education: user?.profile?.education || "",
  });
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [avatarFile, setAvatarFile] = useState(null);
  const [preview, setPreview] = useState(resolveMediaUrl(user?.avatar));
  const [saving, setSaving] = useState(false);
  const photoLocked = user?.role === "student";

  useEffect(() => {
    setAvatar(user?.avatar || "");
    setPreview(resolveMediaUrl(user?.avatar));
  }, [user?.avatar]);

  const change = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  const chooseAvatar = (e) => {
    if (photoLocked) return toast.error("Student face photo can only be updated through support or coach approval");
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Please select a valid image file");
    setAvatarFile(file);
    setAvatar("");
    setPreview(URL.createObjectURL(file));
  };
  const removeAvatar = () => {
    if (photoLocked) return toast.error("Student face photo cannot be removed from this panel");
    setAvatarFile(null);
    setAvatar(null);
    setPreview("");
    if (inputRef.current) inputRef.current.value = "";
  };
  const uploadAvatar = async () => {
    if (!avatarFile) return avatar;
    const data = new FormData();
    data.append("file", avatarFile);
    const res = await api.post("/upload/image", data, { headers: { "Content-Type": "multipart/form-data" } });
    return res.upload?.url || res.material?.url || "";
  };
  const save = async () => {
    setSaving(true);
    try {
      const avatarUrl = await uploadAvatar();
      const payload = {
        name: form.name,
        title: form.title,
        avatar: photoLocked ? (user?.avatar || null) : (avatarUrl || null),
        profile: { phone: form.phone, city: form.city, bio: form.bio, expertise: form.expertise, education: form.education },
      };
      const res = await api.put("/profile", payload);
      updateUser(res.user);
      setAvatarFile(null);
      setAvatar(res.user?.avatar || "");
      setPreview(resolveMediaUrl(res.user?.avatar));
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err?.message || "Profile update failed");
    } finally {
      setSaving(false);
    }
  };

  return <div className="space-y-5 rounded-2xl bg-white p-6 shadow-sm"><div className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-center"><div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-indigo-600 text-white ring-4 ring-indigo-50">{preview ? <img src={preview} alt={form.name || "Profile"} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-3xl font-black">{(form.name || "U")[0]}</div>}</div><div className="min-w-0 flex-1"><p className="font-semibold text-gray-800">{form.name || user?.email}</p><p className="text-sm text-gray-500">{user?.email}</p><span className="mt-1 inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-600">{user?.role}</span><div className="mt-3 flex flex-wrap gap-2">{photoLocked ? <p className="rounded-lg bg-sky-50 px-3 py-2 text-xs font-bold text-sky-700">Student face photo is locked. Contact support or your coach to request an update.</p> : <><button type="button" onClick={() => inputRef.current?.click()} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"><Camera size={14} /> {preview ? "Change Photo" : "Add Photo"}</button><button type="button" onClick={removeAvatar} disabled={!preview && !avatarFile} className="inline-flex items-center gap-2 rounded-lg border border-red-100 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"><Trash2 size={14} /> Remove</button><input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={chooseAvatar} /></>}</div></div></div><div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><Field label="Full Name" name="name" value={form.name} onChange={change} /><Field label="Title" name="title" value={form.title} onChange={change} /><Field label="Phone" name="phone" value={form.phone} onChange={change} /><Field label="City" name="city" value={form.city} onChange={change} /><Field label="Expertise" name="expertise" value={form.expertise} onChange={change} /><Field label="Education" name="education" value={form.education} onChange={change} /></div><div><label className="mb-1 block text-sm font-medium text-gray-700">Bio</label><textarea name="bio" value={form.bio} onChange={change} rows={3} className="w-full resize-none rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" /></div><div className="flex justify-end"><button onClick={save} disabled={saving} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"><Save size={16} /> {saving ? "Saving..." : "Save Changes"}</button></div></div>;
}

function SecurityTab() {
  const [show, setShow] = useState({ old: false, new: false, confirm: false });
  const [form, setForm] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [saving, setSaving] = useState(false);
  const toggle = (key) => setShow((p) => ({ ...p, [key]: !p[key] }));
  const change = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  const submit = async () => { if (!form.oldPassword || !form.newPassword) return toast.error("Old and new password required"); if (form.newPassword !== form.confirmPassword) return toast.error("Confirm password does not match"); setSaving(true); try { await api.post("/auth/change-password", { oldPassword: form.oldPassword, newPassword: form.newPassword }); setForm({ oldPassword: "", newPassword: "", confirmPassword: "" }); toast.success("Password updated"); } catch (err) { toast.error(err?.message || "Password update failed"); } finally { setSaving(false); } };
  const fields = [{ label: "Current Password", key: "old", name: "oldPassword" }, { label: "New Password", key: "new", name: "newPassword" }, { label: "Confirm Password", key: "confirm", name: "confirmPassword" }];
  return <div className="max-w-md space-y-5 rounded-2xl bg-white p-6 shadow-sm"><h3 className="font-semibold text-gray-700">Change Password</h3>{fields.map(({ label, key, name }) => <div key={key}><label className="mb-1 block text-sm font-medium text-gray-700">{label}</label><div className="relative"><input name={name} value={form[name]} onChange={change} type={show[key] ? "text" : "password"} className="w-full rounded-lg border px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" /><button type="button" onClick={() => toggle(key)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{show[key] ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></div>)}<button onClick={submit} disabled={saving} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"><Save size={16} /> {saving ? "Updating..." : "Update Password"}</button></div>;
}

function NotificationsTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { let alive = true; const load = async () => { try { const res = await api.get("/notifications"); if (alive) setItems(res.notifications || []); } catch (err) { toast.error(err?.message || "Notifications load failed"); } finally { if (alive) setLoading(false); } }; load(); return () => { alive = false; }; }, []);
  return <div className="overflow-hidden rounded-2xl bg-white shadow-sm"><div className="border-b px-5 py-4"><h3 className="font-semibold text-gray-800">Notifications</h3></div>{loading ? <p className="p-5 text-sm text-gray-500">Loading...</p> : items.length === 0 ? <p className="p-5 text-sm text-gray-500">No notifications yet</p> : <div className="divide-y">{items.map((item) => <div key={item.id} className="p-5"><div className="flex items-start justify-between gap-4"><div><p className="font-semibold text-gray-800">{item.title}</p><p className="mt-1 text-sm text-gray-500">{item.message}</p></div><span className="text-xs text-gray-400">{item.created_at ? formatDateTime(item.created_at) : ""}</span></div></div>)}</div>}</div>;
}

function Field({ label, ...props }) {
  return <label className="block"><span className="mb-1 block text-sm font-medium text-gray-700">{label}</span><input {...props} className="w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" /></label>;
}