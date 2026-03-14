function FlowItem({ item }) {
    if (item.type === 'node') {
      return (
        <span className={`px-2 py-1 rounded-md border text-xs font-mono ${item.color}`}>
          {item.label}
        </span>
      )
    }
    return (
      <span className={`text-xs font-mono ${item.labelColor || 'text-slate-600'}`}>
        {item.label}
      </span>
    )
}

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

  const hitFlow = [
    { type: 'node',  label: 'React UI', color: 'bg-blue-950 border-blue-700 text-blue-300' },
    { type: 'arrow', label: '→' },
    { type: 'node',  label: 'Node.js', color: 'bg-yellow-950 border-yellow-700 text-yellow-300' },
    { type: 'arrow', label: '→' },
    { type: 'node',  label: 'Redis', color: 'bg-red-950 border-red-700 text-red-300' },
    { type: 'arrow', label: '-' },
    { type: 'arrow', label: '-' },
    { type: 'arrow', label: '-' },
    { type: 'arrow', label: '-' },
    { type: 'arrow', label: '→' },
    { type: 'arrow', label: 'Hit', labelColor: 'text-emerald-500' },
    { type: 'arrow', label: '-' },
    { type: 'arrow', label: '-' },
    { type: 'arrow', label: '-' },
    { type: 'arrow', label: '-' },
    { type: 'arrow', label: '→' },
    { type: 'node',  label: 'Redirect', color: 'bg-teal-950 border-teal-700 text-teal-300' },
    { type: 'arrow', label: '→' },
    { type: 'node',  label: 'Kafka', color: 'bg-emerald-950 border-emerald-700 text-emerald-300' },
    { type: 'arrow', label: '→' },
    { type: 'node',  label: 'Consumer', color: 'bg-purple-950 border-purple-700 text-purple-300' },
    { type: 'arrow', label: '→' },
    { type: 'node',  label: 'PG click count++', color: 'bg-blue-950 border-blue-700 text-blue-300' },
  ]

  const missFlow = [
    { type: 'arrow', label: 'miss →', labelColor: 'text-orange-500' },
    { type: 'node',  label: 'PostgreSQL', color: 'bg-blue-950 border-blue-700 text-blue-300' },
    { type: 'arrow', label: '→' },
    { type: 'node',  label: 'Redis', color: 'bg-red-950 border-red-700 text-red-300' },
    { type: 'arrow', label: '→' },
    { type: 'arrow', label: 'Redirect ↑', labelColor: 'text-teal-500' },
  ]

  return (
    <div className="mt-8 bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
      <h3 className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-4">
        <span className="hidden min-[900px]:inline">Architecture Flow</span>
        <span className="inline min-[900px]:hidden">Design Decisions</span>
      </h3>
      <div className="hidden min-[900px]:block mb-6">
        <div className="flex flex-col gap-3 items-start">
            {/* Row 1 — HIT path */}
            <div className="flex items-center gap-2">
            {hitFlow.map((item, i) => (
                <FlowItem key={i} item={item} />
            ))}
            </div>

            {/* Row 2 — MISS path */}
            <div className="flex items-center gap-2 pl-[184px]">
            {missFlow.map((item, i) => (
                <FlowItem key={i} item={item} />
            ))}
            </div>

        </div>
      </div>  

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