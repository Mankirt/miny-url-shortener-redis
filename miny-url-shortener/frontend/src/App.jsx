import { useState, useEffect } from 'react'
import Header from './components/Header'
import ShortenForm from './components/ShortenForm'
import StatsStrip from './components/StatsStrip'
import UrlTable from './components/UrlTable'
import ArchPanel from './components/ArchPanel'
import { api } from './api'

export default function App() {

  const [urls, setUrls] = useState([])
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState(null)   

  useEffect(() => {
    loadUrls()

    const interval = setInterval(() => {
      loadUrls()
    }, 10000)

    return () => clearInterval(interval)
  }, []) 

  async function loadUrls() {
    try {
      const data = await api.getUrls()
      setUrls(data)
      setError(null)
    } catch (err) {
      console.error('Could not load URLs:', err)
      setError('Could not connect to server.')
    } finally {
      setInitialLoading(false)
    }
  }

  function handleDelete(shortCode) {
    setUrls(prev => prev.filter(u => u.short_code !== shortCode))
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">

      <Header />

      <main className="max-w-4xl mx-auto px-6 py-12">

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
        
        <ShortenForm onSuccess={loadUrls} />
        <StatsStrip urls={urls} />
        {initialLoading ? (
          <div className="bg-slate-900 border border-slate-800
                          rounded-2xl py-16 text-center">
            <div className="w-6 h-6 border-2 border-slate-700
                            border-t-violet-500 rounded-full
                            animate-spin mx-auto mb-3" />
            <p className="text-slate-500 text-sm">Loading URLs...</p>
          </div>
        ) : error ? (
          <div className="bg-slate-900 border border-red-900 rounded-2xl py-16 text-center">
            <p className="text-red-400 text-sm mb-3">{error}</p>
            <button
              onClick={loadUrls}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              ↻ Try again
            </button>
          </div>

        ) :
         (
          <UrlTable urls={urls} onDelete={handleDelete} onRefresh={loadUrls} />
         )}
        <ArchPanel />

      </main>
    </div>
  )
}