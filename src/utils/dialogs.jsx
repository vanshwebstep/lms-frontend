import toast from "react-hot-toast";

const actionClass = (tone) => tone === "danger"
  ? "rounded-lg bg-red-600 px-3 py-2 text-sm font-bold text-white hover:bg-red-700"
  : "rounded-lg bg-slate-900 px-3 py-2 text-sm font-bold text-white hover:bg-slate-800";

export const confirmDialog = ({ title = "Are you sure?", message = "", confirmText = "Confirm", cancelText = "Cancel", tone = "danger" } = {}) => new Promise((resolve) => {
  const id = toast.custom((t) => (
    <div className={`w-[min(92vw,420px)] rounded-xl border border-slate-200 bg-white p-5 text-left shadow-2xl ${t.visible ? "animate-enter" : "animate-leave"}`}>
      <h3 className="text-base font-black text-slate-950">{title}</h3>
      {message && <p className="mt-2 text-sm leading-6 text-slate-600">{message}</p>}
      <div className="mt-5 flex justify-end gap-2">
        <button type="button" className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50" onClick={() => { toast.dismiss(id); resolve(false); }}>{cancelText}</button>
        <button type="button" className={actionClass(tone)} onClick={() => { toast.dismiss(id); resolve(true); }}>{confirmText}</button>
      </div>
    </div>
  ), { duration: Infinity, position: "top-center" });
});

export const selectDialog = ({ title = "Select an option", message = "", options = [], cancelText = "Cancel" } = {}) => new Promise((resolve) => {
  const id = toast.custom((t) => (
    <div className={`w-[min(92vw,460px)] rounded-xl border border-slate-200 bg-white p-5 text-left shadow-2xl ${t.visible ? "animate-enter" : "animate-leave"}`}>
      <h3 className="text-base font-black text-slate-950">{title}</h3>
      {message && <p className="mt-2 text-sm leading-6 text-slate-600">{message}</p>}
      <div className="mt-4 max-h-72 space-y-2 overflow-y-auto">
        {options.map((option) => (
          <button key={option.value} type="button" className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-left text-sm hover:border-slate-400 hover:bg-slate-50" onClick={() => { toast.dismiss(id); resolve(option.value); }}>
            <span className="block font-bold text-slate-900">{option.label}</span>
            {option.description && <span className="mt-0.5 block text-xs text-slate-500">{option.description}</span>}
          </button>
        ))}
      </div>
      <div className="mt-5 flex justify-end">
        <button type="button" className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50" onClick={() => { toast.dismiss(id); resolve(null); }}>{cancelText}</button>
      </div>
    </div>
  ), { duration: Infinity, position: "top-center" });
});
