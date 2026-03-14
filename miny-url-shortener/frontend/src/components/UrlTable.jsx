import { Link2 } from 'lucide-react'

export default function UrlTable({ urls, onDelete, onRefresh }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">

      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
        <h2 className="font-semibold text-sm text-white">
          Recent URLs
        </h2>
        <button
          onClick={onRefresh}
          className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
        >
          ↻ Refresh
        </button>
      </div>

      {/* Table Rows */}
      {urls.length === 0 ? (
        <div className="py-16 text-center">
          <Link2 size={32} className="text-slate-700 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">
            No URLs yet. Shorten your first one above!
          </p>
        </div>
      ) : (
        {/* Table rows */}
      )}

    </div>
  )
}