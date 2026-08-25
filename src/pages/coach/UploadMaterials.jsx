import { useEffect, useRef, useState } from "react";
import { Download, FileText, FolderOpen, Search, Trash2, Upload } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";
import { confirmDialog } from "../../utils/dialogs";

const formatSize = (bytes = 0) => bytes ? `${(Number(bytes) / 1024 / 1024).toFixed(1)} MB` : "-";

export default function UploadMaterials() {
  const [materials, setMaterials] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get("/coach/materials");
      setMaterials(res.materials || []);
    } catch (err) {
      toast.error(err?.message || "Failed to load materials");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleFiles = async (files) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData(); formData.append("file", file); await api.post("/coach/materials", formData, { headers: { "Content-Type": "multipart/form-data" } });
      }
      toast.success("Material saved");
      await load();
    } catch (err) {
      toast.error(err?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const remove = async (id) => {
    const ok = await confirmDialog({ title: "Delete material?", message: "This uploaded material will be removed.", confirmText: "Delete Material", tone: "danger" });
    if (!ok) return;
    try {
      await api.delete(`/coach/materials/${id}`);
      toast.success("Material deleted");
      load();
    } catch (err) {
      toast.error(err?.message || "Delete failed");
    }
  };

  const filtered = materials.filter((item) => item.name?.toLowerCase().includes(search.toLowerCase()));

  return <div className="space-y-6"><div><h2 className="text-2xl font-bold text-gray-800">Upload Materials</h2><p className="mt-1 text-sm text-gray-500">Files are uploaded to the backend local uploads folder. Replace storage with S3/Cloudinary later if needed.</p></div><div className="rounded-2xl bg-white p-5 shadow-sm"><div onClick={() => inputRef.current?.click()} className="cursor-pointer rounded-2xl border-2 border-dashed border-gray-300 p-10 text-center hover:border-indigo-400 hover:bg-gray-50"><input ref={inputRef} type="file" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} /><Upload size={36} className="mx-auto mb-3 text-gray-400" /><p className="font-medium text-gray-600">{uploading ? "Saving..." : "Click to choose files"}</p><p className="mt-1 text-sm text-gray-400">PDF, ZIP, DOC, PPT, image, video</p></div></div><div className="rounded-2xl bg-white p-4 shadow-sm"><div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search materials..." className="w-full rounded-lg border py-2 pl-9 pr-3 text-sm" /></div></div><div className="overflow-hidden rounded-2xl bg-white shadow-sm">{loading ? <div className="p-10 text-center text-gray-400">Loading...</div> : filtered.length === 0 ? <div className="p-16 text-center text-gray-400"><FolderOpen size={40} className="mx-auto mb-3 opacity-40" />No materials found</div> : <table className="w-full text-sm"><thead className="bg-gray-50 text-left text-xs font-bold uppercase text-gray-500"><tr><th className="px-5 py-3">File</th><th className="px-5 py-3">Type</th><th className="px-5 py-3">Size</th><th className="px-5 py-3">Uploaded</th><th className="px-5 py-3">Actions</th></tr></thead><tbody className="divide-y divide-gray-100">{filtered.map((item) => <tr key={item.id} className="hover:bg-gray-50"><td className="px-5 py-3"><div className="flex items-center gap-2"><FileText size={15} className="text-indigo-500" /><span className="font-medium text-gray-800">{item.name}</span></div></td><td className="px-5 py-3 text-gray-600">{item.type}</td><td className="px-5 py-3 text-gray-600">{formatSize(item.sizeBytes)}</td><td className="px-5 py-3 text-gray-600">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "-"}</td><td className="px-5 py-3"><div className="flex gap-1"><a href={item.url || "#"} className="rounded-lg p-1.5 hover:bg-green-50" title="Download"><Download size={14} className="text-green-600" /></a><button onClick={() => remove(item.id)} className="rounded-lg p-1.5 hover:bg-red-50"><Trash2 size={14} className="text-red-500" /></button></div></td></tr>)}</tbody></table>}</div></div>;
}
