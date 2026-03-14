import { Link2, BarChart3 } from 'lucide-react'

export default function UrlTable({ urls, onDelete, onRefresh }) {
  const baseUrl = 'http://localhost:3001'

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
        <div className="divide-y divide-slate-800 overflow-y-auto max-h-96">
          {urls.map(u => (
            <div
              key={u.short_code}
              className="px-6 py-4 flex items-center gap-4 hover:bg-slate-800/40 transition-colors"
            >
              {/* Short code — fixed width, never shrinks */}
              <div className="font-mono text-sm text-violet-400 font-semibold w-20 shrink-0">
                /{u.short_code}
              </div>

              {/* Original URL — takes remaining space, truncates */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-300 truncate">
                  {u.original_url}
                </p>
              </div>

              {/* Click count — fixed width, never shrinks */}
              <div className="flex items-center gap-1.5 text-xs text-slate-500 w-20 justify-end shrink-0">
                <BarChart3 size={12} />
                <span>{u.click_count || 0} clicks</span>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  )
}