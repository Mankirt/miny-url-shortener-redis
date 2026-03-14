import Header from './components/Header'
import ShortenForm from './components/ShortenForm'
import StatsStrip from './components/StatsStrip'
import UrlTable from './components/UrlTable'
import ArchPanel from './components/ArchPanel'

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">

      <Header />

      <main className="max-w-4xl mx-auto px-6 py-12">

        {/* Hero section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1
                          rounded-full bg-violet-950 border border-violet-700
                          text-violet-300 text-xs font-mono mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            Backed by Redis cache + Kafka event streaming
          </div>
          <h1 className="text-5xl font-black tracking-tight mb-4
                         bg-gradient-to-br from-white to-slate-400
                         bg-clip-text text-transparent">
            Shorten. Share.<br />Scale to millions.
          </h1>
          <p className="text-slate-400 text-lg max-w-lg mx-auto">
            Production-grade URL shortener with caching,
            async analytics, and rate limiting.
          </p>
        </div>

        <ShortenForm onSuccess={() => {}} />
        <StatsStrip urls={[]} />
        <UrlTable urls={[]} onDelete={() => {}} onRefresh={() => {}} />
        <ArchPanel />

      </main>
    </div>
  )
}