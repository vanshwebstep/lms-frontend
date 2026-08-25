import { useEffect, useState } from "react";
import { Award, Download } from "lucide-react";
import api from "../../services/api";

export default function Certificates() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    api.get("/student/certificates").then((res) => {
      if (alive) setCertificates(res.certificates || []);
    }).finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  return <div className="space-y-6"><div><h2 className="text-2xl font-bold text-slate-900">Certificates</h2><p className="mt-1 text-sm text-slate-500">Certificates unlock automatically when course progress reaches 100%.</p></div>{loading ? <div className="rounded-2xl bg-white p-10 text-center text-slate-500 shadow-sm">Loading certificates...</div> : certificates.length === 0 ? <div className="rounded-2xl bg-white p-10 text-center text-slate-500 shadow-sm"><Award className="mx-auto mb-3 text-sky-500" size={44} /><p>No certificates issued yet</p></div> : <div className="grid grid-cols-1 gap-5 md:grid-cols-2">{certificates.map((cert) => <div key={cert.id} className="rounded-2xl bg-white p-5 shadow-sm"><div className="flex items-start gap-4"><div className="rounded-xl bg-sky-50 p-3 text-sky-600"><Award size={24} /></div><div className="min-w-0 flex-1"><h3 className="font-bold text-slate-900">{cert.course?.title || "Course Certificate"}</h3><p className="mt-1 text-sm text-slate-500">Certificate No: {cert.certificateNo}</p><p className="mt-1 text-xs text-slate-400">Issued: {cert.issuedAt ? new Date(cert.issuedAt).toLocaleDateString() : "-"}</p></div>{cert.fileUrl && <a href={cert.fileUrl} className="rounded-lg border p-2 text-slate-600 hover:bg-slate-50"><Download size={16} /></a>}</div></div>)}</div>}</div>;
}
