import { Construction } from 'lucide-react'

const PlaceholderPage = ({ title, description }) => (
  <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-slate-700">
    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
      <Construction size={24} />
    </div>
    <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
    {description && <p className="mt-2 max-w-2xl text-sm text-slate-500">{description}</p>}
  </div>
)

export default PlaceholderPage
