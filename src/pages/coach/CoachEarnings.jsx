import { useEffect, useMemo, useState } from "react";
import { DollarSign, TrendingUp, Users, Download, ArrowUpRight, ArrowDownRight, Filter } from "lucide-react";
import api from "../../services/api";
import { formatCurrency, formatDate } from "../../utils/formatters";

const DEFAULT_EARNINGS = { grossRevenue: 0, platformFee: 0, netRevenue: 0, history: [] };

export default function CoachEarnings() {
  const [earnings, setEarnings] = useState(DEFAULT_EARNINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => { let alive = true; const load = async () => { try { setLoading(true); const res = await api.get("/coach/earnings"); if (alive) setEarnings(res.earnings || DEFAULT_EARNINGS); } catch (err) { if (alive) setError(err?.message || "Failed to load earnings"); } finally { if (alive) setLoading(false); } }; load(); return () => { alive = false; }; }, []);

  const transactions = useMemo(() => earnings.history || [], [earnings.history]);
  const filtered = transactions.filter((t) => statusFilter === "All" || t.status === statusFilter.toLowerCase());
  const paidUsers = useMemo(() => new Set(transactions.filter((t) => t.status === "success").map((t) => t.studentId)).size, [transactions]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div><h2 className="text-2xl font-bold text-gray-800">Earnings</h2><p className="text-sm text-gray-500 mt-1">{loading ? "Loading revenue..." : "Track your revenue and transactions"}</p></div><button className="flex items-center gap-2 border px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition"><Download size={16} /> Export CSV</button></div>
      {error && <div className="bg-red-50 text-red-600 border border-red-100 rounded-xl px-4 py-3 text-sm">{error}</div>}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">{[{ label: "Gross Revenue", value: formatCurrency(earnings.grossRevenue || 0), sub: "before platform fee", icon: DollarSign, color: "text-indigo-600", bg: "bg-indigo-100", up: true }, { label: "Net Revenue", value: formatCurrency(earnings.netRevenue || 0), sub: `${formatCurrency(earnings.platformFee || 0)} fee`, icon: TrendingUp, color: "text-green-600", bg: "bg-green-100", up: true }, { label: "Paid Users", value: paidUsers, sub: `${transactions.length} transactions`, icon: Users, color: "text-yellow-600", bg: "bg-yellow-100", up: false }].map((s) => (<div key={s.label} className="bg-white rounded-2xl shadow-sm p-5"><div className="flex items-center justify-between mb-3"><div className={`${s.bg} p-2.5 rounded-xl`}><s.icon size={20} className={s.color} /></div><span className={`flex items-center gap-1 text-xs font-medium ${s.up ? "text-green-500" : "text-red-400"}`}>{s.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}{s.sub}</span></div><p className="text-2xl font-bold text-gray-800">{s.value}</p><p className="text-xs text-gray-500 mt-1">{s.label}</p></div>))}</div>
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden"><div className="flex items-center justify-between px-5 py-4 border-b"><h3 className="font-semibold text-gray-700">Transaction History</h3><div className="flex items-center gap-2"><Filter size={15} className="text-gray-400" /><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">{["All", "success", "pending", "failed", "refunded"].map((s) => <option key={s}>{s}</option>)}</select></div></div><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-gray-50"><tr>{["#", "Student", "Course", "Amount", "Date", "Status"].map((h) => <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>)}</tr></thead><tbody className="divide-y divide-gray-100">{loading ? <tr><td colSpan={6} className="px-5 py-10 text-center text-gray-400">Loading transactions...</td></tr> : filtered.length === 0 ? <tr><td colSpan={6} className="px-5 py-10 text-center text-gray-400">No transactions found</td></tr> : filtered.map((t) => (<tr key={t.id} className="hover:bg-gray-50 transition-colors"><td className="px-5 py-3 text-gray-400">#{String(t.id).slice(-6)}</td><td className="px-5 py-3 font-medium text-gray-800">{t.student?.name || "-"}</td><td className="px-5 py-3"><span className="bg-indigo-50 text-indigo-600 text-xs px-2 py-1 rounded-full">{t.course?.title || "-"}</span></td><td className="px-5 py-3 font-semibold text-gray-800">{formatCurrency(t.amount || 0, t.currency || "INR")}</td><td className="px-5 py-3 text-gray-500 text-xs">{t.createdAt ? formatDate(t.createdAt) : "-"}</td><td className="px-5 py-3"><span className={`text-xs px-2 py-1 rounded-full font-medium ${t.status === "success" ? "bg-green-100 text-green-600" : t.status === "pending" ? "bg-yellow-100 text-yellow-600" : "bg-red-100 text-red-500"}`}>{t.status}</span></td></tr>))}</tbody></table></div></div>
    </div>
  );
}