import { Link2, Database, Zap, Activity, Server } from 'lucide-react'

function TechBadge({label, color}){
    return (
        <span className={`px-2 py-1 rounded-full text-xs font-mono font-semibold border ${color}`}>
            {label}
         </span>
    )
}

export default function Header() {
  return (
    <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
            <Link2 size={16} className="text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight text-white">
            Miny - Url Shortener
          </span>
          <span className="text-slate-600 text-sm font-mono hidden sm:block">
            / Miny - Url Shortener
          </span>
        </div>

        {/* Tech badges — always visible, shows stack at a glance */}
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <TechBadge
            label="PostgreSQL"
            color="text-blue-400 border-blue-800 bg-blue-950/40"
          />
          <TechBadge
            label="Redis"
            color="text-red-400 border-red-800 bg-red-950/40"
          />
          <TechBadge
            label="Kafka"
            color="text-emerald-400 border-emerald-800 bg-emerald-950/40"
          />
          <TechBadge
            label="Node.js"
            color="text-yellow-400 border-yellow-800 bg-yellow-950/40"
          />
        </div>

      </div>
    </header>
  )
}