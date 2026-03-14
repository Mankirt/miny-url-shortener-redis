export default function ArchPanel() {

  const designPoints = [
    {
      title: 'Cache-Aside',
      desc: 'Check Redis first. On miss, query PostgreSQL and populate cache.',
      color: 'text-red-400',
    },
    {
      title: 'Fire & Forget',
      desc: 'Click events published to Kafka without blocking the redirect.',
      color: 'text-emerald-400',
    },
    {
      title: 'Base62 + XOR',
      desc: 'Sequential IDs encoded with XOR scrambling and shuffled charset.',
      color: 'text-violet-400',
    },
  ]

  return (
    <div className="mt-8 bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
      <h3 className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-4">
        Design Decisions
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {designPoints.map(point => (
          <div key={point.title} className="bg-slate-800/50 rounded-xl p-3 border border-slate-700">
            <p className={`text-xs font-mono font-semibold mb-1 ${point.color}`}>
              {point.title}
            </p>
            <p className="text-xs text-slate-500">
              {point.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}