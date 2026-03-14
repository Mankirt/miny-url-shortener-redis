import { Link2, BarChart3, Zap } from 'lucide-react'

export default function StatsStrip({ urls }) {
  const totalClicks = urls.reduce((sum, u) => sum + (u.click_count || 0), 0)

  const stats = [
    {
      label: 'URLs Shortened',
      value: urls.length,
      icon: Link2,
      color: 'text-violet-400',
    },
    {
      label: 'Total Clicks',
      value: totalClicks,
      icon: BarChart3,
      color: 'text-emerald-400',
    },
    {
      label: 'Cache Layer',
      value: 'Redis',
      icon: Zap,
      color: 'text-red-400',
    },
  ]

  return (
    <div className="grid grid-cols-3 gap-4 mb-8">
      {stats.map(stat => (
        <div
          key={stat.label}
          className="bg-slate-900 border border-slate-800
                     rounded-xl p-4 text-center"
        >
          <stat.icon size={20} className={`${stat.color} mx-auto mb-2`} />
          <div className="text-2xl font-black text-white">
            {stat.value}
          </div>
          <div className="text-slate-500 text-xs mt-1">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  )
}